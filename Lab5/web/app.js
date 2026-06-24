/**
 * NeuraMatch Studio — Photo Matching với Siamese Network
 * Frontend Logic: Upload ảnh, gọi API, hiển thị kết quả
 */

// ══════════════════════════════════════════════════════════
// CẤU HÌNH
// ══════════════════════════════════════════════════════════

// URL API Backend (thay đổi khi deploy lên Render)
const API_BASE = 'http://localhost:5000';

// ══════════════════════════════════════════════════════════
// DOM ELEMENTS
// ══════════════════════════════════════════════════════════
const dropzone1 = document.getElementById('dropzone1');
const dropzone2 = document.getElementById('dropzone2');
const fileInput1 = document.getElementById('fileInput1');
const fileInput2 = document.getElementById('fileInput2');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');
const placeholder1 = document.getElementById('placeholder1');
const placeholder2 = document.getElementById('placeholder2');
const clear1 = document.getElementById('clear1');
const clear2 = document.getElementById('clear2');
const compareBtn = document.getElementById('compareBtn');
const thresholdInput = document.getElementById('thresholdInput');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('results');

// State: lưu base64 của 2 ảnh
let image1Data = null;
let image2Data = null;

// ══════════════════════════════════════════════════════════
// DROPZONE LOGIC
// ══════════════════════════════════════════════════════════

/**
 * Thiết lập sự kiện cho một dropzone
 * @param {HTMLElement} zone - Dropzone element
 * @param {HTMLInputElement} input - File input element
 * @param {HTMLImageElement} preview - Preview image element
 * @param {HTMLElement} placeholder - Placeholder element
 * @param {HTMLButtonElement} clearBtn - Clear button
 * @param {number} index - 1 hoặc 2
 */
function setupDropzone(zone, input, preview, placeholder, clearBtn, index) {
  // Click để chọn file
  zone.addEventListener('click', (e) => {
    if (e.target === clearBtn || e.target.closest('.dropzone__clear')) return;
    input.click();
  });

  // Drag & drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file, index);
  });

  // File input change
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) handleFile(file, index);
  });

  // Clear button
  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearImage(index);
  });
}

/**
 * Xử lý file ảnh: hiển thị preview + lưu base64
 */
function handleFile(file, index) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;

    if (index === 1) {
      image1Data = base64;
      showPreview(preview1, placeholder1, clear1, dropzone1, base64);
    } else {
      image2Data = base64;
      showPreview(preview2, placeholder2, clear2, dropzone2, base64);
    }

    updateCompareButton();
  };
  reader.readAsDataURL(file);
}

/**
 * Hiển thị preview ảnh trong dropzone
 */
function showPreview(preview, placeholder, clearBtn, zone, src) {
  preview.src = src;
  preview.classList.add('visible');
  placeholder.style.display = 'none';
  clearBtn.hidden = false;
  zone.classList.add('has-image');
}

/**
 * Xóa ảnh khỏi dropzone
 */
function clearImage(index) {
  if (index === 1) {
    image1Data = null;
    preview1.classList.remove('visible');
    preview1.src = '';
    placeholder1.style.display = '';
    clear1.hidden = true;
    dropzone1.classList.remove('has-image');
    fileInput1.value = '';
  } else {
    image2Data = null;
    preview2.classList.remove('visible');
    preview2.src = '';
    placeholder2.style.display = '';
    clear2.hidden = true;
    dropzone2.classList.remove('has-image');
    fileInput2.value = '';
  }
  updateCompareButton();
}

/**
 * Bật/tắt nút So sánh
 */
function updateCompareButton() {
  compareBtn.disabled = !(image1Data && image2Data);
}

// Khởi tạo 2 dropzone
setupDropzone(dropzone1, fileInput1, preview1, placeholder1, clear1, 1);
setupDropzone(dropzone2, fileInput2, preview2, placeholder2, clear2, 2);

// ══════════════════════════════════════════════════════════
// SO SÁNH (GỌI API)
// ══════════════════════════════════════════════════════════

compareBtn.addEventListener('click', async () => {
  if (!image1Data || !image2Data) return;

  const threshold = parseFloat(thresholdInput.value) || 1.0;

  // Hiển thị loading
  compareBtn.querySelector('.btn-compare__text').hidden = true;
  compareBtn.querySelector('.btn-compare__loader').hidden = false;
  compareBtn.disabled = true;
  loadingState.hidden = false;
  resultsSection.hidden = true;

  try {
    const response = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image1: image1Data,
        image2: image2Data,
        threshold: threshold
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      displayResults(data);
    } else {
      throw new Error(data.error || 'Có lỗi xảy ra từ server');
    }
  } catch (err) {
    alert(`❌ Lỗi: ${err.message}\n\nHãy chắc chắn backend đang chạy tại: ${API_BASE}`);
    console.error('API Error:', err);
  } finally {
    // Reset loading state
    compareBtn.querySelector('.btn-compare__text').hidden = false;
    compareBtn.querySelector('.btn-compare__loader').hidden = true;
    compareBtn.disabled = false;
    loadingState.hidden = true;
  }
});

// ══════════════════════════════════════════════════════════
// HIỂN THỊ KẾT QUẢ
// ══════════════════════════════════════════════════════════

/**
 * Hiển thị kết quả so sánh lên giao diện
 * @param {Object} data - Response từ API
 */
function displayResults(data) {
  const { distance, is_similar, similarity_pct, threshold, embedding_dim, feature1, feature2 } = data;

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // --- Ring gauge (vòng tròn %) ---
  const ring = document.getElementById('similarityRing');
  const pctText = document.getElementById('similarityPct');
  const circumference = 2 * Math.PI * 52; // r=52 → C ≈ 326.73
  const pct = Math.max(0, Math.min(100, similarity_pct));
  const offset = circumference - (pct / 100) * circumference;

  ring.style.strokeDashoffset = offset;
  ring.style.stroke = is_similar ? 'var(--accent-2)' : 'var(--accent-danger)';
  pctText.textContent = `${pct.toFixed(0)}%`;

  // --- Verdict badge ---
  const badge = document.getElementById('verdictBadge');
  badge.textContent = is_similar ? '✓ Giống nhau' : '✗ Khác nhau';
  badge.className = `verdict__badge ${is_similar ? 'similar' : 'dissimilar'}`;

  // --- Detail text ---
  document.getElementById('verdictDetail').textContent = is_similar
    ? `Khoảng cách Euclidean (${distance.toFixed(4)}) nhỏ hơn ngưỡng (${threshold}). Hai ảnh được đánh giá là tương đồng.`
    : `Khoảng cách Euclidean (${distance.toFixed(4)}) lớn hơn hoặc bằng ngưỡng (${threshold}). Hai ảnh được đánh giá là khác nhau.`;

  // --- Stats ---
  document.getElementById('statDistance').textContent = distance.toFixed(4);
  document.getElementById('statThreshold').textContent = threshold;
  document.getElementById('statEmbedding').textContent = `${embedding_dim}D`;

  // --- Feature vectors visualization ---
  if (feature1 && feature2) {
    drawFeatureVector('featureCanvas1', feature1, is_similar ? '#06d6a0' : '#7c5cfc');
    drawFeatureVector('featureCanvas2', feature2, is_similar ? '#06d6a0' : '#ef476f');
    document.getElementById('featurePanel').hidden = false;
  }
}

/**
 * Vẽ biểu đồ feature vector lên canvas
 * @param {string} canvasId - ID của canvas element
 * @param {number[]} values - Mảng giá trị feature vector
 * @param {string} color - Màu đường vẽ
 */
function drawFeatureVector(canvasId, values, color) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  // Set canvas resolution
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const padding = 8;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Normalize values to [0, 1]
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const normalized = values.map(v => (v - min) / range);

  // Draw bars
  const barWidth = (w - 2 * padding) / values.length;
  normalized.forEach((v, i) => {
    const x = padding + i * barWidth;
    const barH = v * (h - 2 * padding);
    const y = h - padding - barH;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3 + v * 0.7;
    ctx.fillRect(x, y, Math.max(barWidth - 0.5, 1), barH);
  });

  ctx.globalAlpha = 1;
}

// ══════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  // Enter → So sánh
  if (e.key === 'Enter' && !compareBtn.disabled) {
    compareBtn.click();
  }
});

console.log('🧠 NeuraMatch Studio loaded — Ready for Photo Matching!');
