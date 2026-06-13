/* ═══════════════════════════════════════════════════════════
   Wavelet Studio — Frontend Logic
   Xử lý upload, gửi API, hiển thị kết quả
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── DOM refs ────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const dropzone1   = $('#dropzone1');
  const dropzone2   = $('#dropzone2');
  const fileInput1  = $('#fileInput1');
  const fileInput2  = $('#fileInput2');
  const preview1    = $('#preview1');
  const preview2    = $('#preview2');
  const placeholder1 = $('#placeholder1');
  const placeholder2 = $('#placeholder2');
  const clear1      = $('#clear1');
  const clear2      = $('#clear2');
  const compareBtn  = $('#compareBtn');
  const compareAllBtn = $('#compareAllBtn');
  const waveletSel  = $('#waveletSelect');
  const loadingEl   = $('#loadingState');
  const loadingText = $('#loadingText');
  const resultsEl   = $('#results');

  // Store base64 data
  let image1Data = null;
  let image2Data = null;

  // ── Dropzone setup ──────────────────────────────────────
  function setupDropzone(zone, input, previewImg, placeholderEl, clearBtn, slot) {
    // Click to open file picker
    zone.addEventListener('click', (e) => {
      if (e.target === clearBtn) return;
      input.click();
    });

    // Keyboard
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });

    // File input change
    input.addEventListener('change', () => {
      if (input.files.length) handleFile(input.files[0], zone, previewImg, slot);
    });

    // Drag & drop
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile(file, zone, previewImg, slot);
    });

    // Clear button
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      previewImg.src = '';
      zone.classList.remove('has-image');
      clearBtn.hidden = true;
      input.value = '';
      if (slot === 1) image1Data = null;
      else image2Data = null;
      updateButtons();
    });
  }

  function handleFile(file, zone, previewImg, slot) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result;
      previewImg.src = b64;
      zone.classList.add('has-image');
      zone.querySelector('.dropzone__clear').hidden = false;
      if (slot === 1) image1Data = b64;
      else image2Data = b64;
      updateButtons();
      // Hide results when image changes
      resultsEl.hidden = true;
    };
    reader.readAsDataURL(file);
  }

  function updateButtons() {
    const ready = image1Data && image2Data;
    compareBtn.disabled = !ready;
    compareAllBtn.disabled = !ready;
  }

  setupDropzone(dropzone1, fileInput1, preview1, placeholder1, clear1, 1);
  setupDropzone(dropzone2, fileInput2, preview2, placeholder2, clear2, 2);

  // ── Compare single wavelet ──────────────────────────────
  compareBtn.addEventListener('click', async () => {
    if (!image1Data || !image2Data) return;
    await runComparison();
  });

  async function runComparison() {
    showLoading('Đang gửi ảnh...');
    setButtonLoading(true);

    try {
      updateLoadingText('Đang phân tích wavelet...');

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image1: image1Data,
          image2: image2Data,
          wavelet: waveletSel.value,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Unknown error');

      updateLoadingText('Đang render kết quả...');
      await delay(300);
      hideLoading();
      renderResults(data);

    } catch (err) {
      hideLoading();
      alert('Lỗi: ' + err.message);
      console.error(err);
    } finally {
      setButtonLoading(false);
    }
  }

  // ── Compare all wavelets ────────────────────────────────
  compareAllBtn.addEventListener('click', async () => {
    if (!image1Data || !image2Data) return;

    // Run single comparison first if results not showing
    if (resultsEl.hidden) await runComparison();

    showLoading('Đang so sánh tất cả wavelet...');
    setButtonLoading(true);

    try {
      const res = await fetch('/api/compare-wavelets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: image1Data, image2: image2Data }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Unknown error');

      hideLoading();
      renderMultiResults(data.results);

    } catch (err) {
      hideLoading();
      alert('Lỗi: ' + err.message);
      console.error(err);
    } finally {
      setButtonLoading(false);
    }
  });

  // ── Render results ──────────────────────────────────────
  function renderResults(data) {
    const c = data.comparison;
    const img1 = data.image1;
    const img2 = data.image2;

    // Verdict ring
    const pct = c.similarity_pct;
    const ring = $('#similarityRing');
    const circumference = 2 * Math.PI * 52; // r=52
    const offset = circumference * (1 - c.similarity);
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = c.is_similar ? 'var(--success)' : 'var(--danger)';

    // Animated percentage
    animateCounter($('#similarityPct'), 0, pct, 1000, (v) => v.toFixed(1) + '%');

    // Badge
    const badge = $('#verdictBadge');
    badge.textContent = c.is_similar ? 'Tương tự' : 'Khác biệt';
    badge.className = 'verdict__badge ' + (c.is_similar ? 'verdict__badge--similar' : 'verdict__badge--different');

    // Detail text
    $('#verdictDetail').textContent = c.is_similar
      ? `Hai ảnh có mức tương đồng ${pct}% — vượt ngưỡng ${(c.threshold * 100)}%, được xếp loại là tương tự.`
      : `Hai ảnh chỉ tương đồng ${pct}% — dưới ngưỡng ${(c.threshold * 100)}%, được xếp loại là khác biệt.`;

    // Stats
    $('#statDistance').textContent = c.hamming_distance.toLocaleString();
    $('#statBits').textContent = c.total_bits.toLocaleString();
    $('#statWavelet').textContent = c.wavelet_used;

    // Wavelet images
    renderWaveletGrid('wavelet1', img1.wavelet);
    renderWaveletGrid('wavelet2', img2.wavelet);

    // Hash images
    $('#hash1Img').src = img1.hash_preview;
    $('#hash2Img').src = img2.hash_preview;
    $('#hashDiffImg').src = c.diff_preview;

    // Hide multi panel
    $('#multiPanel').hidden = true;

    // Show results section
    resultsEl.hidden = false;
    resultsEl.classList.add('fade-in');
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderWaveletGrid(containerId, waveletData) {
    const container = $(`#${containerId}`);
    const labels = {
      cA: 'cA · Xấp xỉ',
      cH: 'cH · Ngang',
      cV: 'cV · Dọc',
      cD: 'cD · Chéo',
    };
    container.innerHTML = '';
    for (const [key, dataUrl] of Object.entries(waveletData)) {
      const cell = document.createElement('div');
      cell.className = 'wavelet-cell';
      cell.innerHTML = `
        <img src="${dataUrl}" alt="${key}" />
        <span class="wavelet-cell__tag">${labels[key]}</span>
      `;
      container.appendChild(cell);
    }
  }

  function renderMultiResults(results) {
    const panel = $('#multiPanel');
    const tbody = $('#multiBody');
    const chart = $('#multiChart');

    tbody.innerHTML = '';
    chart.innerHTML = '';

    const maxSim = Math.max(...results.map((r) => r.similarity_pct));

    results.forEach((r) => {
      // Table row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600">${r.wavelet}</td>
        <td>${r.distance.toLocaleString()}</td>
        <td>${r.similarity_pct}%</td>
        <td>
          <div class="sim-bar-track">
            <div class="sim-bar-fill" style="width:${r.similarity_pct}%"></div>
          </div>
        </td>
      `;
      tbody.appendChild(tr);

      // Chart bar
      const wrap = document.createElement('div');
      wrap.className = 'chart-bar-wrap';
      const barH = Math.max((r.similarity_pct / 100) * 110, 4);
      wrap.innerHTML = `
        <span class="chart-bar-value">${r.similarity_pct}%</span>
        <div class="chart-bar" style="height:${barH}px"></div>
        <span class="chart-bar-label">${r.wavelet}</span>
      `;
      chart.appendChild(wrap);
    });

    panel.hidden = false;
    panel.classList.add('fade-in');
  }

  // ── Helpers ─────────────────────────────────────────────
  function showLoading(text) {
    loadingText.textContent = text;
    loadingEl.hidden = false;
    resultsEl.hidden = true;
  }
  function hideLoading() {
    loadingEl.hidden = true;
  }
  function updateLoadingText(text) {
    loadingText.textContent = text;
  }
  function setButtonLoading(loading) {
    const txt = compareBtn.querySelector('.btn-compare__text');
    const loader = compareBtn.querySelector('.btn-compare__loader');
    if (loading) {
      txt.textContent = 'Đang xử lý...';
      loader.hidden = false;
      compareBtn.disabled = true;
      compareAllBtn.disabled = true;
    } else {
      txt.textContent = 'So sánh';
      loader.hidden = true;
      updateButtons();
    }
  }

  function animateCounter(el, from, to, duration, fmt) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = from + (to - from) * eased;
      el.textContent = fmt(current);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

})();
