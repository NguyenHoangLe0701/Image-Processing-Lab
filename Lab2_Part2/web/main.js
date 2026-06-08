import './style.css';

// === DOM ===
const video = document.getElementById('videoInput');
const canvas = document.getElementById('canvasOutput');
const overlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const blurSlider = document.getElementById('blurSlider');
const lowThreshSlider = document.getElementById('lowThreshSlider');
const highThreshSlider = document.getElementById('highThreshSlider');

// === State ===
let streaming = false;
let mode = 'canny';
let frontCam = true;
let cap, src, dst, gray, blurred;

// =============================================
// 1. Chờ OpenCV WASM khởi tạo xong
// =============================================
function waitForOpenCv() {
  if (typeof cv !== 'undefined' && cv.getBuildInformation) {
    console.log('OpenCV.js ready');
    loadingText.innerText = 'Đang khởi động Camera...';
    openCamera();
  } else {
    setTimeout(waitForOpenCv, 100);
  }
}
waitForOpenCv();

// =============================================
// 2. Mở Camera
// =============================================
function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError('Trình duyệt không hỗ trợ Camera hoặc chưa dùng HTTPS!');
    return;
  }

  const tryConstraints = [
    { video: { facingMode: frontCam ? 'user' : 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: true, audio: false }
  ];

  function tryNext(i) {
    if (i >= tryConstraints.length) {
      showError('Không tìm thấy Camera. Hãy kiểm tra thiết bị!');
      return;
    }
    navigator.mediaDevices.getUserMedia(tryConstraints[i])
      .then(onCameraSuccess)
      .catch(() => tryNext(i + 1));
  }
  tryNext(0);
}

function onCameraSuccess(stream) {
  video.srcObject = stream;
  video.play();
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    streaming = false;
    freeMats();
    showLoading('Camera bị ngắt. Đang kết nối lại...');
    setTimeout(openCamera, 1000);
  });
}

function closeCamera() {
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  video.srcObject = null;
}

function showError(msg) {
  loadingText.innerText = msg;
  loadingText.style.color = '#ff4444';
  document.querySelector('.spinner').style.display = 'none';
}

function showLoading(msg) {
  overlay.classList.remove('hidden');
  document.querySelector('.spinner').style.display = 'block';
  loadingText.innerText = msg;
  loadingText.style.color = '';
}

// =============================================
// 3. Khi video phát -> bắt đầu xử lý
// =============================================
video.addEventListener('playing', () => {
  if (streaming) return;
  waitDimensions();
});

function waitDimensions() {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    startStream();
  } else {
    setTimeout(waitDimensions, 50);
  }
}

function startStream() {
  if (streaming) return;
  const w = video.videoWidth, h = video.videoHeight;
  canvas.width = w;
  canvas.height = h;

  // Dùng VideoCapture chính thức của OpenCV.js
  cap = new cv.VideoCapture(video);
  src = new cv.Mat(h, w, cv.CV_8UC4);
  dst = new cv.Mat(h, w, cv.CV_8UC1);
  gray = new cv.Mat();
  blurred = new cv.Mat();

  streaming = true;
  overlay.classList.add('hidden');
  console.log(`Streaming ${w}x${h}`);
  tick();
}

// =============================================
// 4. Vòng lặp xử lý ảnh
// =============================================
function tick() {
  if (!streaming) return;

  try {
    if (video.readyState >= 2) {
      // Đọc frame bằng VideoCapture (cách chính thức OpenCV.js)
      cap.read(src);

      if (mode === 'canny') {
        // Bước 1: Chuyển sang ảnh xám
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Bước 2: Làm mờ Gaussian (giảm nhiễu)
        let k = parseInt(blurSlider.value);
        if (k % 2 === 0) k++;
        let ksize = new cv.Size(k, k);
        cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
        ksize.delete();

        // Bước 3: Phát hiện biên Canny
        cv.Canny(blurred, dst, parseInt(lowThreshSlider.value), parseInt(highThreshSlider.value), 3, false);

        // Hiển thị kết quả
        cv.imshow('canvasOutput', dst);
      } else {
        // Hiển thị ảnh gốc
        cv.imshow('canvasOutput', src);
      }
    }
  } catch (e) {
    console.error('Frame error:', e);
  }

  requestAnimationFrame(tick);
}

// =============================================
// 5. Giải phóng bộ nhớ
// =============================================
function freeMats() {
  try {
    if (src) src.delete();
    if (dst) dst.delete();
    if (gray) gray.delete();
    if (blurred) blurred.delete();
  } catch (e) { /* ignore */ }
  cap = src = dst = gray = blurred = null;
}

// =============================================
// 6. UI Events
// =============================================
document.getElementById('modeOriginal').addEventListener('click', () => {
  mode = 'original';
  document.getElementById('modeOriginal').classList.add('active');
  document.getElementById('modeCanny').classList.remove('active');
  document.getElementById('cannyControls').classList.add('disabled');
});

document.getElementById('modeCanny').addEventListener('click', () => {
  mode = 'canny';
  document.getElementById('modeCanny').classList.add('active');
  document.getElementById('modeOriginal').classList.remove('active');
  document.getElementById('cannyControls').classList.remove('disabled');
});

blurSlider.addEventListener('input', e => document.getElementById('blurVal').innerText = e.target.value);
lowThreshSlider.addEventListener('input', e => document.getElementById('lowThreshVal').innerText = e.target.value);
highThreshSlider.addEventListener('input', e => document.getElementById('highThreshVal').innerText = e.target.value);

document.getElementById('switchCameraBtn').addEventListener('click', () => {
  frontCam = !frontCam;
  canvas.classList.toggle('environment', !frontCam);
  closeCamera();
  streaming = false;
  freeMats();
  showLoading('Đang chuyển Camera...');
  openCamera();
});

window.addEventListener('beforeunload', () => { closeCamera(); freeMats(); });
