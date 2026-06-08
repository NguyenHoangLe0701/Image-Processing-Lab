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
// 2. Mở Camera (3 cấp fallback)
// =============================================
function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError('Trình duyệt không hỗ trợ Camera hoặc chưa dùng HTTPS!');
    return;
  }
  const tries = [
    { video: { facingMode: frontCam ? 'user' : 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: true, audio: false }
  ];
  function attempt(i) {
    if (i >= tries.length) { showError('Không tìm thấy Camera!'); return; }
    navigator.mediaDevices.getUserMedia(tries[i]).then(onStream).catch(() => attempt(i + 1));
  }
  attempt(0);
}

function onStream(stream) {
  video.srcObject = stream;
  video.play();
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    streaming = false;
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
  (function checkSize() {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      streaming = true;
      overlay.classList.add('hidden');
      console.log(`Streaming ${canvas.width}x${canvas.height}`);
      tick();
    } else {
      setTimeout(checkSize, 50);
    }
  })();
});

// =============================================
// 4. Vòng lặp xử lý ảnh
//    Tạo Mat mới mỗi frame rồi xóa ngay
//    -> Chậm hơn nhưng KHÔNG BAO GIỜ lỗi kích thước
// =============================================
function tick() {
  if (!streaming) return;

  try {
    if (video.readyState >= 2) {
      // Vẽ video lên canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (mode === 'canny') {
        // Đọc pixel từ canvas bằng matFromImageData (tường minh nhất)
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let src = cv.matFromImageData(imgData);
        let gray = new cv.Mat();
        let blur = new cv.Mat();
        let edges = new cv.Mat();

        // Pipeline Canny
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        let k = parseInt(blurSlider.value);
        if (k % 2 === 0) k++;
        let ksize = new cv.Size(k, k);
        cv.GaussianBlur(gray, blur, ksize, 0, 0, cv.BORDER_DEFAULT);
        ksize.delete();

        cv.Canny(blur, edges, parseInt(lowThreshSlider.value), parseInt(highThreshSlider.value), 3, false);

        // Hiển thị kết quả
        cv.imshow('canvasOutput', edges);

        // Giải phóng bộ nhớ
        src.delete(); gray.delete(); blur.delete(); edges.delete();
      }
    }
  } catch (e) {
    // HIỆN LỖI TRÊN MÀN HÌNH (để debug trên mobile)
    document.title = 'ERR: ' + e.message;
    console.error('Frame error:', e);
  }

  requestAnimationFrame(tick);
}

// =============================================
// 5. UI Events
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
  showLoading('Đang chuyển Camera...');
  openCamera();
});

window.addEventListener('beforeunload', () => closeCamera());
