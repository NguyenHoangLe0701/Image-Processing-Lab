import './style.css';

// DOM Elements
const video = document.getElementById('videoInput');
const canvas = document.getElementById('canvasOutput');
// willReadFrequently is important for performance when calling getImageData repeatedly
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

const modeOriginal = document.getElementById('modeOriginal');
const modeCanny = document.getElementById('modeCanny');
const cannyControls = document.getElementById('cannyControls');
const switchCameraBtn = document.getElementById('switchCameraBtn');

const blurSlider = document.getElementById('blurSlider');
const lowThreshSlider = document.getElementById('lowThreshSlider');
const highThreshSlider = document.getElementById('highThreshSlider');

const blurVal = document.getElementById('blurVal');
const lowThreshVal = document.getElementById('lowThreshVal');
const highThreshVal = document.getElementById('highThreshVal');

// App State
let streaming = false;
let currentMode = 'canny'; // 'original' or 'canny'
let useFrontCamera = true; // Start with front camera (user)
let cvReady = false;

// OpenCV Mats
let src = null;
let dst = null;
let gray = null;
let blurred = null;

// Ensure OpenCV is ready globally (called from index.html script tag onload)
window.onOpenCvReady = function () {
  console.log("OpenCV.js is ready.");
  cvReady = true;
  loadingText.innerText = "Đang khởi động Camera...";
  initCamera();
};

// ==========================================
// UI Event Listeners
// ==========================================

modeOriginal.addEventListener('click', () => {
  currentMode = 'original';
  modeOriginal.classList.add('active');
  modeCanny.classList.remove('active');
  cannyControls.classList.add('disabled');
});

modeCanny.addEventListener('click', () => {
  currentMode = 'canny';
  modeCanny.classList.add('active');
  modeOriginal.classList.remove('active');
  cannyControls.classList.remove('disabled');
});

switchCameraBtn.addEventListener('click', () => {
  useFrontCamera = !useFrontCamera;
  
  // Handle CSS mirroring for front vs back camera
  if (useFrontCamera) {
    canvas.classList.remove('environment');
  } else {
    canvas.classList.add('environment');
  }

  if (streaming) {
    stopCamera();
    initCamera();
  }
});

// Update Slider values text in UI
blurSlider.addEventListener('input', (e) => blurVal.innerText = e.target.value);
lowThreshSlider.addEventListener('input', (e) => lowThreshVal.innerText = e.target.value);
highThreshSlider.addEventListener('input', (e) => highThreshVal.innerText = e.target.value);

// ==========================================
// Camera Handling
// ==========================================

function initCamera() {
  const constraints = {
    video: {
      facingMode: useFrontCamera ? "user" : "environment",
      // Ideal resolution (will scale down to screen size)
      width: { ideal: 640 },
      height: { ideal: 480 } 
    },
    audio: false
  };

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error("getUserMedia is not supported or not in a secure context (HTTPS).");
    loadingText.innerText = "Lỗi: Trình duyệt không hỗ trợ Camera hoặc đang dùng HTTP. Yêu cầu dùng HTTPS hoặc localhost!";
    loadingText.style.color = "#ff4444";
    document.querySelector('.spinner').style.display = 'none';
    return;
  }

  navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
      console.error("Camera Error:", err);
      loadingText.innerText = "Không thể truy cập Camera. Vui lòng cấp quyền (Allow) khi trình duyệt yêu cầu!";
      loadingText.style.color = "#ff4444";
      document.querySelector('.spinner').style.display = 'none';
    });
}

function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
}

// ==========================================
// Processing Loop (OpenCV)
// ==========================================

video.addEventListener('canplay', function(e) {
  if (!streaming) {
    // Setup Canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Init OpenCV matrices matching the resolution
    src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
    dst = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC1);
    gray = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC1);
    blurred = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC1);
    
    streaming = true;
    loadingOverlay.classList.add('hidden'); // Hide loading screen
    
    // Start processing loop
    requestAnimationFrame(processVideo);
  }
}, false);

function processVideo() {
  if (!streaming) return;
  if (!cvReady) {
    requestAnimationFrame(processVideo);
    return;
  }

  try {
    // 1. Draw video to hidden canvas context and read it into cv.Mat
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    src.data.set(imageData.data);

    if (currentMode === 'original') {
      // Just render original directly
      cv.imshow('canvasOutput', src);
    } else {
      // ======================================
      // CANNY ALGORITHM PIPELINE
      // ======================================
      
      // Step 1: Grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      
      // Step 2: Gaussian Blur (noise reduction)
      let blurKsize = parseInt(blurSlider.value);
      // Ensure Ksize is odd
      if (blurKsize % 2 === 0) blurKsize += 1; 
      
      let ksize = new cv.Size(blurKsize, blurKsize);
      cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
      ksize.delete(); // Bắt buộc phải giải phóng bộ nhớ C++ của object này
      
      // Step 3: Canny Edge Detection
      let lowThresh = parseInt(lowThreshSlider.value);
      let highThresh = parseInt(highThreshSlider.value);
      cv.Canny(blurred, dst, lowThresh, highThresh, 3, false);
      
      // Render edges to canvas
      cv.imshow('canvasOutput', dst);
    }
  } catch (err) {
    console.error("Processing Error:", err);
  }

  // Schedule next frame
  requestAnimationFrame(processVideo);
}

// Clean up memory on unload
window.addEventListener('beforeunload', () => {
  stopCamera();
  if (src) src.delete();
  if (dst) dst.delete();
  if (gray) gray.delete();
  if (blurred) blurred.delete();
});
