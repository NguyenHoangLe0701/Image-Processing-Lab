import './style.css';

// === DOM ===
const overlay = document.getElementById('loadingOverlay');
const uploadSection = document.getElementById('uploadSection');
const resultSection = document.getElementById('resultSection');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const cameraInput = document.getElementById('cameraInput');
const canvasDisplay = document.getElementById('canvasDisplay');
const blurSlider = document.getElementById('blurSlider');
const lowThreshSlider = document.getElementById('lowThreshSlider');
const highThreshSlider = document.getElementById('highThreshSlider');
const modeOriginal = document.getElementById('modeOriginal');
const modeCanny = document.getElementById('modeCanny');

let originalMat = null;
let currentEdges = null;
let mode = 'canny'; // 'original' hoặc 'canny'

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
document.getElementById('uploadBtn').addEventListener('click', e => {
  e.preventDefault();
  fileInput.click();
});
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

document.getElementById('captureBtn').addEventListener('click', () => cameraInput.click());
cameraInput.addEventListener('change', e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

document.getElementById('changeImageBtn').addEventListener('click', () => {
  uploadSection.classList.remove('hidden');
  resultSection.classList.add('hidden');
  if (originalMat) { originalMat.delete(); originalMat = null; }
  if (currentEdges) { currentEdges.delete(); currentEdges = null; }
  fileInput.value = '';
  cameraInput.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  blurSlider.value = 5;
  lowThreshSlider.value = 50;
  highThreshSlider.value = 150;
  document.getElementById('blurVal').innerText = '5';
  document.getElementById('lowThreshVal').innerText = '50';
  document.getElementById('highThreshVal').innerText = '150';
  applyCanny();
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = mode === 'canny' ? 'canny_result.png' : 'original_image.png';
  link.href = canvasDisplay.toDataURL('image/png');
  link.click();
});

// =============================================
// 3. Chuyển đổi mode Ảnh gốc / Canny
// =============================================
modeOriginal.addEventListener('click', () => {
  mode = 'original';
  modeOriginal.classList.add('active');
  modeCanny.classList.remove('active');
  if (originalMat && !originalMat.empty()) {
    cv.imshow('canvasDisplay', originalMat);
  }
});

modeCanny.addEventListener('click', () => {
  mode = 'canny';
  modeCanny.classList.add('active');
  modeOriginal.classList.remove('active');
  applyCanny(); // Luôn chạy lại để đảm bảo hiển thị đúng
});

// =============================================
// 4. Đọc ảnh và hiển thị
// =============================================
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Giới hạn kích thước tối đa
      let w = img.width, h = img.height;
      const MAX = 800;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }

      // Vẽ ảnh ra một canvas ẩn để lấy pixel
      const hiddenCanvas = document.createElement('canvas');
      hiddenCanvas.width = w;
      hiddenCanvas.height = h;
      const ctx = hiddenCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      // Đọc vào OpenCV Mat bằng hàm imread chuẩn
      if (originalMat) originalMat.delete();
      originalMat = cv.imread(hiddenCanvas);

      // Hiện kết quả
      uploadSection.classList.add('hidden');
      resultSection.classList.remove('hidden');

      // Đặt mode về Canny mặc định
      mode = 'canny';
      modeCanny.classList.add('active');
      modeOriginal.classList.remove('active');

      // Chạy Canny
      applyCanny();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// =============================================
// 5. Thuật toán Canny
// =============================================
function applyCanny() {
  if (!originalMat || originalMat.empty()) return;

  if (currentEdges) {
    currentEdges.delete();
    currentEdges = null;
  }
  
  let gray = new cv.Mat();
  let blurred = new cv.Mat();
  currentEdges = new cv.Mat();

  try {
    // Bước 1: Grayscale
    cv.cvtColor(originalMat, gray, cv.COLOR_RGBA2GRAY, 0);

    // Bước 2: Gaussian Blur
    let k = parseInt(blurSlider.value);
    if (k % 2 === 0) k++;
    let ksize = new cv.Size(k, k);
    cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);

    // Bước 3: Canny
    cv.Canny(blurred, currentEdges, parseInt(lowThreshSlider.value), parseInt(highThreshSlider.value), 3, false);

    // Nếu đang ở mode Canny thì hiển thị kết quả
    if (mode === 'canny') {
      cv.imshow('canvasDisplay', currentEdges);
    }
  } catch (e) {
    console.error('Canny error:', e);
    
    // In lỗi trực tiếp lên Canvas để dễ debug
    const ctx = canvasDisplay.getContext('2d');
    canvasDisplay.width = originalMat.cols;
    canvasDisplay.height = originalMat.rows;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasDisplay.width, canvasDisplay.height);
    ctx.fillStyle = '#ef4444';
    ctx.font = '20px Arial';
    
    // Đôi khi OpenCV.js quăng lỗi dạng số (pointer)
    let msg = typeof e === 'number' ? 'Lỗi Pointer: ' + e : e.message;
    ctx.fillText('Lỗi OpenCV: ' + msg, 20, 50);
  } finally {
    // Xoá bộ nhớ tạm
    if (gray) gray.delete();
    if (blurred) blurred.delete();
  }
}

// =============================================
// 6. Cập nhật khi kéo thanh trượt
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
