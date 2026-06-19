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

  // Search DOM refs
  const dropzoneSearch = $('#dropzoneSearch');
  const fileInputSearch = $('#fileInputSearch');
  const previewSearch = $('#previewSearch');
  const placeholderSearch = $('#placeholderSearch');
  const clearSearch = $('#clearSearch');
  const searchBtn = $('#searchBtn');
  const waveletSearchSelect = $('#waveletSearchSelect');
  const searchResultsEl = $('#searchResults');
  const searchGrid = $('#searchGrid');

  // Store base64 data
  let image1Data = null;
  let image2Data = null;
  let searchImageData = null;

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
      else if (slot === 2) image2Data = null;
      else searchImageData = null;
      updateButtons();
    });
  }

  function handleFile(file, zone, previewImg, slot) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawB64 = e.target.result;
      previewImg.src = rawB64; // Hiển thị ảnh gốc trên giao diện
      
      // Resize ảnh xuống 256x256 trước khi lưu data để gửi API (Fix lỗi 413 Vercel)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        // Vẽ ảnh thu nhỏ lên canvas
        ctx.drawImage(img, 0, 0, 256, 256);
        // Lấy chuỗi base64 đã nén (định dạng JPEG để giảm dung lượng thêm)
        const resizedB64 = canvas.toDataURL('image/jpeg', 0.8);
        
        zone.classList.add('has-image');
        zone.querySelector('.dropzone__clear').hidden = false;
        
        if (slot === 1) image1Data = resizedB64;
        else if (slot === 2) image2Data = resizedB64;
        else searchImageData = resizedB64;
        
        updateButtons();
        if (slot === 1 || slot === 2) resultsEl.hidden = true;
        if (slot === 3 && searchResultsEl) searchResultsEl.hidden = true;
      };
      img.src = rawB64;
    };
    reader.readAsDataURL(file);
  }

  function updateButtons() {
    const ready = image1Data && image2Data;
    compareBtn.disabled = !ready;
    compareAllBtn.disabled = !ready;
    if (searchBtn) searchBtn.disabled = !searchImageData;
  }

  setupDropzone(dropzone1, fileInput1, preview1, placeholder1, clear1, 1);
  setupDropzone(dropzone2, fileInput2, preview2, placeholder2, clear2, 2);
  if (dropzoneSearch) {
    setupDropzone(dropzoneSearch, fileInputSearch, previewSearch, placeholderSearch, clearSearch, 3);
  }

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
    
    // Animated percentage
    animateCounter($('#similarityPct'), 0, pct, 1000, (v) => v.toFixed(1) + '%');

    // Badge
    const badge = $('#verdictBadge');
    let verdictClass, verdictText, verdictDetailText;

    if (c.match_level === 'exact') {
      verdictText = 'Khớp hoàn toàn';
      verdictClass = 'verdict__badge--similar';
      verdictDetailText = `Hai ảnh có mức tương đồng ${pct}% (≥ 85%). Đây có thể là bản sao của nhau.`;
      ring.style.stroke = 'var(--success)';
    } else if (c.match_level === 'similar') {
      verdictText = 'Tương tự (Có thể khác góc chụp)';
      verdictClass = 'verdict__badge--warning';
      verdictDetailText = `Hai ảnh có mức tương đồng ${pct}% (60% - 85%). Dù khác biệt về chi tiết, chúng có thể cùng chụp một đối tượng.`;
      ring.style.stroke = 'var(--warning)';
    } else {
      verdictText = 'Khác biệt';
      verdictClass = 'verdict__badge--different';
      verdictDetailText = `Hai ảnh chỉ tương đồng ${pct}% (< 60%). Đây là hai bức ảnh khác nhau hoàn toàn.`;
      ring.style.stroke = 'var(--danger)';
    }

    badge.textContent = verdictText;
    badge.className = 'verdict__badge ' + verdictClass;
    $('#verdictDetail').textContent = verdictDetailText;

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

  // ── Search logic ─────────────────────────────────────────
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      if (!searchImageData) return;
      showLoading('Đang tìm kiếm trong database...');
      setSearchButtonLoading(true);

      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query_image: searchImageData,
            wavelet: waveletSearchSelect.value,
          }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Unknown error');

        hideLoading();
        renderSearchResults(data.results);

      } catch (err) {
        hideLoading();
        alert('Lỗi: ' + err.message);
        console.error(err);
      } finally {
        setSearchButtonLoading(false);
      }
    });
  }

  function renderSearchResults(results) {
    searchGrid.innerHTML = '';
    
    if (!results || results.length === 0) {
      searchGrid.innerHTML = '<p style="color:var(--text-3);grid-column:1/-1;text-align:center;padding:20px;">Không có dữ liệu trong database.</p>';
      searchResultsEl.hidden = false;
      return;
    }

    results.forEach(r => {
      const item = document.createElement('div');
      item.className = 'search-item fade-in';
      
      let simColor, isMatchLabel;
      if (r.match_level === 'exact') {
        simColor = 'var(--success)';
        isMatchLabel = '<span class="search-item__match">Bản sao</span>';
      } else if (r.match_level === 'similar') {
        simColor = 'var(--warning)';
        isMatchLabel = '<span class="search-item__match" style="background:var(--warning-dim);color:var(--warning)">Tương tự</span>';
      } else {
        simColor = 'var(--accent)';
        isMatchLabel = '';
      }
      
      item.innerHTML = `
        <img src="/database/${r.filename}" alt="${r.filename}" loading="lazy" />
        <div class="search-item__info">
          <div class="search-item__name" title="${r.filename}">${r.filename}</div>
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px;">
            <div>
              <div style="font-size:.7rem; color:var(--text-3)">Khoảng cách: ${r.distance}</div>
              ${isMatchLabel}
            </div>
            <div style="font-size:.9rem; font-weight:700; color:${simColor}">${r.similarity}%</div>
          </div>
        </div>
      `;
      searchGrid.appendChild(item);
    });

    searchResultsEl.hidden = false;
    searchResultsEl.classList.add('fade-in');
    searchResultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setSearchButtonLoading(loading) {
    const txt = searchBtn.querySelector('.btn-compare__text');
    const loader = searchBtn.querySelector('.btn-compare__loader');
    if (loading) {
      txt.textContent = 'Đang tìm...';
      loader.hidden = false;
      searchBtn.disabled = true;
    } else {
      txt.textContent = 'Tìm kiếm';
      loader.hidden = true;
      updateButtons();
    }
  }

  // ── Load sample images for search ─────────────────────────
  async function loadSamples() {
    const grid = $('#sampleGrid');
    if (!grid) return;
    try {
      const res = await fetch('/api/samples');
      const data = await res.json();
      if (data.success && data.samples) {
        grid.innerHTML = '';
        data.samples.forEach(filename => {
          const img = document.createElement('img');
          img.src = '/database/' + filename;
          img.className = 'sample-img';
          img.title = filename;
          img.addEventListener('click', () => selectSample(img.src));
          grid.appendChild(img);
        });
      }
    } catch (e) {
      console.error('Failed to load samples', e);
    }
  }

  function selectSample(url) {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const rawB64 = e.target.result;
          previewSearch.src = rawB64;
          
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 256, 256);
            searchImageData = canvas.toDataURL('image/jpeg', 0.8);
            
            dropzoneSearch.classList.add('has-image');
            clearSearch.hidden = false;
            updateButtons();
            if (searchResultsEl) searchResultsEl.hidden = true;
          };
          img.src = rawB64;
        };
        reader.readAsDataURL(blob);
      });
  }

  loadSamples();

})();
