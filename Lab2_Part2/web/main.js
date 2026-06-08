import './style.css';

const video = document.getElementById('videoInput');
const canvas = document.getElementById('canvasOutput');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const overlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

const blurSlider = document.getElementById('blurSlider');
const lowThreshSlider = document.getElementById('lowThreshSlider');
const highThreshSlider = document.getElementById('highThreshSlider');

let streaming = false;
let currentMode = 'canny';
let useFrontCamera = true;
let src, dst, gray, blurred;

// --- Chờ OpenCV.js sẵn sàng ---
function waitForOpenCv() {
  try {
    new cv.Mat().delete();
    loadingText.innerText = 'Đang khởi động Camera...';
    startCamera();
  } catch {
    setTimeout(waitForOpenCv, 100);
  }
}
waitForOpenCv();

// --- Camera ---
function startCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: useFrontCamera ? 'user' : 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false
  }).then(stream => {
    video.srcObject = stream;
    video.play();
  }).catch(() => {
    loadingText.innerText = 'Không thể truy cập Camera. Hãy cấp quyền và dùng HTTPS!';
    loadingText.style.color = '#ff4444';
    document.querySelector('.spinner').style.display = 'none';
  });
}

function stopCamera() {
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
}

// --- Khi video bắt đầu phát ---
video.addEventListener('playing', function init() {
  if (streaming) return;
  // Chờ kích thước video sẵn sàng
  (function check() {
    if (video.videoWidth === 0) return setTimeout(check, 50);
    const w = video.videoWidth, h = video.videoHeight;
    canvas.width = w; canvas.height = h;
    src = new cv.Mat(h, w, cv.CV_8UC4);
    dst = new cv.Mat(h, w, cv.CV_8UC1);
    gray = new cv.Mat(h, w, cv.CV_8UC1);
    blurred = new cv.Mat(h, w, cv.CV_8UC1);
    streaming = true;
    overlay.classList.add('hidden');
    requestAnimationFrame(processVideo);
  })();
});

// --- Vòng lặp xử lý ảnh ---
function processVideo() {
  if (!streaming) return;
  if (video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    src.data.set(ctx.getImageData(0, 0, canvas.width, canvas.height).data);

    if (currentMode === 'canny') {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      let k = parseInt(blurSlider.value); if (k % 2 === 0) k++;
      let ksize = new cv.Size(k, k);
      cv.GaussianBlur(gray, blurred, ksize, 0);
      ksize.delete();
      cv.Canny(blurred, dst, parseInt(lowThreshSlider.value), parseInt(highThreshSlider.value));
      cv.imshow('canvasOutput', dst);
    } else {
      cv.imshow('canvasOutput', src);
    }
  }
  requestAnimationFrame(processVideo);
}

// --- UI ---
document.getElementById('modeOriginal').addEventListener('click', () => {
  currentMode = 'original';
  document.getElementById('modeOriginal').classList.add('active');
  document.getElementById('modeCanny').classList.remove('active');
  document.getElementById('cannyControls').classList.add('disabled');
});
document.getElementById('modeCanny').addEventListener('click', () => {
  currentMode = 'canny';
  document.getElementById('modeCanny').classList.add('active');
  document.getElementById('modeOriginal').classList.remove('active');
  document.getElementById('cannyControls').classList.remove('disabled');
});

blurSlider.addEventListener('input', e => document.getElementById('blurVal').innerText = e.target.value);
lowThreshSlider.addEventListener('input', e => document.getElementById('lowThreshVal').innerText = e.target.value);
highThreshSlider.addEventListener('input', e => document.getElementById('highThreshVal').innerText = e.target.value);

document.getElementById('switchCameraBtn').addEventListener('click', () => {
  useFrontCamera = !useFrontCamera;
  canvas.classList.toggle('environment', !useFrontCamera);
  if (streaming) {
    stopCamera();
    streaming = false;
    if (src) { src.delete(); dst.delete(); gray.delete(); blurred.delete(); }
    overlay.classList.remove('hidden');
    loadingText.innerText = 'Đang chuyển Camera...';
    startCamera();
  }
});
