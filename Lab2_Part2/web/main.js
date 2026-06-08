import './style.css';

// === DOM ===
const video = document.getElementById('videoInput');
const canvas = document.getElementById('canvasOutput');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const overlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const blurSlider = document.getElementById('blurSlider');
const lowThreshSlider = document.getElementById('lowThreshSlider');
const highThreshSlider = document.getElementById('highThreshSlider');

// === State ===
let streaming = false;
let mode = 'canny';
let frontCam = true;
let src, dst, gray, blurred;

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
// 2. Mở Camera (tự fallback nếu facingMode lỗi)
// =============================================
function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError('Trình duyệt không hỗ trợ Camera hoặc chưa dùng HTTPS!');
    return;
  }

  // Thử mở camera với facingMode (cho điện thoại)
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: frontCam ? 'user' : 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false
  }).then(onCameraSuccess).catch(err => {
    console.warn('facingMode failed, trying fallback:', err.message);
    // Fallback: mở camera không cần facingMode (cho desktop)
    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    }).then(onCameraSuccess).catch(err2 => {
      console.error('Camera error:', err2);
      showError('Lỗi Camera: ' + err2.message);
    });
  });
}

function onCameraSuccess(stream) {
  video.srcObject = stream;
  video.play();
  // Tự động kết nối lại nếu camera bị ngắt
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    console.log('Camera bị ngắt, đang kết nối lại...');
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
// 3. Khi video thực sự phát -> bắt đầu xử lý
// =============================================
video.addEventListener('playing', () => {
  if (streaming) return;
  waitForVideoDimensions();
});

function waitForVideoDimensions() {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    initProcessing(video.videoWidth, video.videoHeight);
  } else {
    setTimeout(waitForVideoDimensions, 50);
  }
}

function initProcessing(w, h) {
  if (streaming) return;
  canvas.width = w;
  canvas.height = h;
  src = new cv.Mat(h, w, cv.CV_8UC4);
  dst = new cv.Mat(h, w, cv.CV_8UC1);
  gray = new cv.Mat(h, w, cv.CV_8UC1);
  blurred = new cv.Mat(h, w, cv.CV_8UC1);
  streaming = true;
  overlay.classList.add('hidden');
  console.log(`Streaming ${w}x${h}`);
  tick();
}

// =============================================
// 4. Vòng lặp xử lý ảnh (mỗi frame)
// =============================================
function tick() {
  if (!streaming) return;

  try {
    if (video.readyState >= 2) {
      // Đọc frame từ video vào Ma trận OpenCV
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      src.data.set(ctx.getImageData(0, 0, canvas.width, canvas.height).data);

      if (mode === 'canny') {
        // Bước 1: Chuyển sang ảnh xám
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Bước 2: Làm mờ Gaussian
        let k = parseInt(blurSlider.value);
        if (k % 2 === 0) k++;
        let ksize = new cv.Size(k, k);
        cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
        ksize.delete();

        // Bước 3: Canny Edge Detection
        cv.Canny(blurred, dst, parseInt(lowThreshSlider.value), parseInt(highThreshSlider.value), 3, false);

        // Hiển thị kết quả
        cv.imshow('canvasOutput', dst);
      } else {
        cv.imshow('canvasOutput', src);
      }
    }
  } catch (e) {
    console.error('Frame error:', e);
  }

  requestAnimationFrame(tick);
}

// =============================================
// 5. Xóa bộ nhớ OpenCV
// =============================================
function freeMats() {
  if (src) { src.delete(); dst.delete(); gray.delete(); blurred.delete(); }
  src = dst = gray = blurred = null;
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
