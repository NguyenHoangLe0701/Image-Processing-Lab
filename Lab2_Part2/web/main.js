import './style.css';

// === DOM ===
const overlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const uploadSection = document.getElementById('uploadSection');
const resultSection = document.getElementById('resultSection');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const cameraInput = document.getElementById('cameraInput');
const canvasOriginal = document.getElementById('canvasOriginal');
const canvasCanny = document.getElementById('canvasCanny');
const blurSlider = document.getElementById('blurSlider');
const lowThreshSlider = document.getElementById('lowThreshSlider');
const highThreshSlider = document.getElementById('highThreshSlider');

// Lưu ảnh gốc dưới dạng cv.Mat
let originalMat = null;

// =============================================
// 1. Chờ OpenCV.js sẵn sàng
// =============================================
function waitForOpenCv() {
  if (typeof cv !== 'undefined' && cv.getBuildInformation) {
    console.log('OpenCV.js ready');
    overlay.classList.add('hidden');
  } else {
    setTimeout(waitForOpenCv, 100);
  }
}
waitForOpenCv();

// =============================================
// 2. Nhận ảnh (upload / chụp / kéo thả)
// =============================================

// Bấm nút "Chọn ảnh"
document.getElementById('uploadBtn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { if (e.target.files[0]) loadImage(e.target.files[0]); });

// Bấm nút "Chụp ảnh"
document.getElementById('captureBtn').addEventListener('click', () => cameraInput.click());
cameraInput.addEventListener('change', e => { if (e.target.files[0]) loadImage(e.target.files[0]); });

// Kéo thả ảnh
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});

// Bấm "Chọn ảnh khác"
document.getElementById('changeImageBtn').addEventListener('click', () => {
  uploadSection.classList.remove('hidden');
  resultSection.classList.add('hidden');
  if (originalMat) { originalMat.delete(); originalMat = null; }
  fileInput.value = '';
  cameraInput.value = '';
});

// =============================================
// 3. Đọc ảnh vào canvas
// =============================================
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Giới hạn kích thước tối đa (tránh lag trên mobile)
      let w = img.width, h = img.height;
      const MAX = 800;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }

      // Vẽ ảnh gốc lên canvas
      canvasOriginal.width = w;
      canvasOriginal.height = h;
      const ctxOrig = canvasOriginal.getContext('2d');
      ctxOrig.drawImage(img, 0, 0, w, h);

      // Đọc vào OpenCV Mat
      if (originalMat) originalMat.delete();
      originalMat = cv.imread(canvasOriginal);

      // Hiện kết quả
      uploadSection.classList.add('hidden');
      resultSection.classList.remove('hidden');

      // Chạy Canny lần đầu
      applyCanny();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// =============================================
// 4. Áp dụng thuật toán Canny
// =============================================
function applyCanny() {
  if (!originalMat) return;

  let gray = new cv.Mat();
  let blur = new cv.Mat();
  let edges = new cv.Mat();

  try {
    // Bước 1: Chuyển sang ảnh xám
    cv.cvtColor(originalMat, gray, cv.COLOR_RGBA2GRAY, 0);

    // Bước 2: Gaussian Blur (giảm nhiễu)
    let k = parseInt(blurSlider.value);
    if (k % 2 === 0) k++;
    let ksize = new cv.Size(k, k);
    cv.GaussianBlur(gray, blur, ksize, 0, 0, cv.BORDER_DEFAULT);
    ksize.delete();

    // Bước 3: Canny Edge Detection
    cv.Canny(blur, edges, parseInt(lowThreshSlider.value), parseInt(highThreshSlider.value), 3, false);

    // Hiển thị kết quả
    canvasCanny.width = originalMat.cols;
    canvasCanny.height = originalMat.rows;
    cv.imshow('canvasCanny', edges);

  } catch (e) {
    console.error('Canny error:', e);
  }

  // Giải phóng bộ nhớ
  gray.delete(); blur.delete(); edges.delete();
}

// =============================================
// 5. Cập nhật khi kéo thanh trượt
// =============================================
blurSlider.addEventListener('input', e => {
  document.getElementById('blurVal').innerText = e.target.value;
  applyCanny();
});
lowThreshSlider.addEventListener('input', e => {
  document.getElementById('lowThreshVal').innerText = e.target.value;
  applyCanny();
});
highThreshSlider.addEventListener('input', e => {
  document.getElementById('highThreshVal').innerText = e.target.value;
  applyCanny();
});
