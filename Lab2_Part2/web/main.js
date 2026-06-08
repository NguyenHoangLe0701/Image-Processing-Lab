import './style.css';

// === DOM Elements ===
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

let originalMat = null; // Ảnh gốc lưu dưới dạng cv.Mat

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
// 2. Nhận ảnh đầu vào
// =============================================

// Chọn ảnh từ thiết bị
document.getElementById('uploadBtn').addEventListener('click', e => {
  e.preventDefault();
  fileInput.click();
});
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

// Chụp ảnh bằng camera
document.getElementById('captureBtn').addEventListener('click', () => cameraInput.click());
cameraInput.addEventListener('change', e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

// Kéo thả ảnh (drag & drop)
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

// Chọn ảnh khác
document.getElementById('changeImageBtn').addEventListener('click', () => {
  uploadSection.classList.remove('hidden');
  resultSection.classList.add('hidden');
  if (originalMat) { originalMat.delete(); originalMat = null; }
  fileInput.value = '';
  cameraInput.value = '';
});

// Reset tham số về mặc định
document.getElementById('resetBtn').addEventListener('click', () => {
  blurSlider.value = 5;
  lowThreshSlider.value = 50;
  highThreshSlider.value = 150;
  document.getElementById('blurVal').innerText = '5';
  document.getElementById('lowThreshVal').innerText = '50';
  document.getElementById('highThreshVal').innerText = '150';
  applyCanny();
});

// Tải kết quả Canny
document.getElementById('downloadBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'canny_result.png';
  link.href = canvasCanny.toDataURL('image/png');
  link.click();
});

// =============================================
// 3. Đọc ảnh và hiển thị
// =============================================
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Giới hạn kích thước để chạy mượt trên mobile
      let w = img.width, h = img.height;
      const MAX = 800;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }

      // Vẽ ảnh gốc lên canvas
      canvasOriginal.width = w;
      canvasOriginal.height = h;
      canvasOriginal.getContext('2d').drawImage(img, 0, 0, w, h);

      // Đọc pixel vào cv.Mat
      if (originalMat) originalMat.delete();
      originalMat = cv.imread(canvasOriginal);

      // Chuyển sang màn hình kết quả
      uploadSection.classList.add('hidden');
      resultSection.classList.remove('hidden');

      // Chạy Canny
      applyCanny();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// =============================================
// 4. Thuật toán Canny
// =============================================
function applyCanny() {
  if (!originalMat) return;

  // Tạo Mat tạm
  let gray = new cv.Mat();
  let blurred = new cv.Mat();
  let edges = new cv.Mat();

  try {
    // Bước 1: Chuyển sang ảnh xám (Grayscale)
    cv.cvtColor(originalMat, gray, cv.COLOR_RGBA2GRAY, 0);

    // Bước 2: Gaussian Blur – giảm nhiễu
    let k = parseInt(blurSlider.value);
    if (k % 2 === 0) k++;
    let ksize = new cv.Size(k, k);
    cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
    ksize.delete();

    // Bước 3: Canny Edge Detection
    let tLow = parseInt(lowThreshSlider.value);
    let tHigh = parseInt(highThreshSlider.value);
    cv.Canny(blurred, edges, tLow, tHigh, 3, false);

    // Hiển thị kết quả
    canvasCanny.width = edges.cols;
    canvasCanny.height = edges.rows;
    cv.imshow('canvasCanny', edges);
  } catch (e) {
    console.error('Canny error:', e);
  }

  // Giải phóng bộ nhớ
  gray.delete();
  blurred.delete();
  edges.delete();
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
