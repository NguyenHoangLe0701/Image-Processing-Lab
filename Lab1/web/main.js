// ===========================================================
// Image Basics Studio — main.js
// Toàn bộ xử lý ảnh chạy client-side bằng OpenCV.js (WebAssembly)
// ===========================================================

// ---------- DOM refs ----------
const loadingScreen = document.getElementById('loadingScreen');
const appEl = document.getElementById('app');
const fileInput = document.getElementById('fileInput');
const imgSrc = document.getElementById('imgSrc');
const canvasSource = document.getElementById('canvasSource');
const canvasOutput = document.getElementById('canvasOutput');
const emptyState = document.getElementById('emptyState');
const sourceWrap = document.getElementById('sourceWrap');
const cropBoxEl = document.getElementById('cropBox');

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const colorSpaceButtons = document.getElementById('colorSpaceButtons');
const btnCrop = document.getElementById('btnCrop');
const btnResetCrop = document.getElementById('btnResetCrop');
const resizeSlider = document.getElementById('resizeSlider');
const resizeValue = document.getElementById('resizeValue');

const drawToolButtons = document.getElementById('drawToolButtons');
const drawColor = document.getElementById('drawColor');
const drawThickness = document.getElementById('drawThickness');
const textInput = document.getElementById('textInput');
const btnAddText = document.getElementById('btnAddText');
const btnClearDraw = document.getElementById('btnClearDraw');

// ---------- State ----------
let cvReady = false;
let hasImage = false;
let currentTab = 'colorspace';
let currentColorSpace = 'RGB';
let currentDrawTool = 'line';

// Vùng crop đã chọn, theo tọa độ ẢNH GỐC (không phải tọa độ hiển thị trên canvas)
let cropRect = null; // {x, y, w, h}

// Danh sách các nét vẽ đã thêm (theo tọa độ ảnh gốc), để vẽ lại mỗi lần render
let drawings = []; // { type: 'line'|'circle'|'rect'|'text', ...params, color, thickness }

// Biến tạm khi đang kéo chuột (crop hoặc draw)
let isDragging = false;
let dragStart = null; // {x, y} tọa độ hiển thị (canvas client coords)
let dragCurrent = null;

// ---------------------------------------------------------------
// 1. KHỞI TẠO OPENCV.JS
// ---------------------------------------------------------------
function onOpenCvReady() {
  if (cvReady) return; // tránh gọi 2 lần
  cvReady = true;
  loadingScreen.style.display = 'none';
  appEl.classList.remove('hidden');
}

// `cv` có thể đã hoàn tất khởi tạo WASM TRƯỚC KHI dòng code này chạy
// (race condition tuỳ tốc độ mạng/máy), nên ta vừa gán callback,
// vừa poll kiểm tra trực tiếp cv.Mat đã tồn tại hay chưa.
function setupOpenCvInit() {
  if (typeof cv === 'undefined') {
    setTimeout(setupOpenCvInit, 50);
    return;
  }

  // Nếu WASM đã init xong từ trước (cv.Mat đã là function), kích hoạt ngay
  if (typeof cv.Mat === 'function') {
    onOpenCvReady();
    return;
  }

  // Nếu chưa, gán callback chính thức của OpenCV.js
  cv['onRuntimeInitialized'] = onOpenCvReady;

  // Phòng hờ thêm: poll dự phòng trong trường hợp callback không được gọi
  const pollReady = setInterval(() => {
    if (cvReady) {
      clearInterval(pollReady);
      return;
    }
    if (typeof cv.Mat === 'function') {
      clearInterval(pollReady);
      onOpenCvReady();
    }
  }, 100);
}

setupOpenCvInit();

// ---------------------------------------------------------------
// 2. TẢI ẢNH
// ---------------------------------------------------------------
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    imgSrc.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

imgSrc.onload = () => {
  if (!cvReady) return;

  hasImage = true;
  emptyState.style.display = 'none';

  // Reset trạng thái crop / draw khi tải ảnh mới
  cropRect = null;
  drawings = [];
  cropBoxEl.hidden = true;
  resizeSlider.value = 100;
  resizeValue.textContent = '100%';

  renderSource();
  renderOutput();
};

// Vẽ ảnh gốc (đã áp dụng crop nếu có) lên canvasSource
function renderSource() {
  if (!hasImage) return;

  let src = cv.imread(imgSrc);
  cv.imshow('canvasSource', src);
  src.delete();
}

// ---------------------------------------------------------------
// 3. TAB NAVIGATION
// ---------------------------------------------------------------
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentTab = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
    tabContents.forEach((c) =>
      c.classList.toggle('active', c.dataset.tabContent === currentTab)
    );
  });
});

// ---------------------------------------------------------------
// 4. MODULE: CHUYỂN ĐỔI KHÔNG GIAN MÀU
// ---------------------------------------------------------------
colorSpaceButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  currentColorSpace = btn.dataset.cs;
  [...colorSpaceButtons.children].forEach((c) =>
    c.classList.toggle('active', c === btn)
  );
  renderOutput();
});

function applyColorSpace(srcMat) {
  // Trả về một Mat MỚI theo không gian màu đã chọn. Caller chịu trách nhiệm .delete().
  if (currentColorSpace === 'RGB') {
    return srcMat.clone();
  }
  let dst = new cv.Mat();
  if (currentColorSpace === 'GRAY') {
    cv.cvtColor(srcMat, dst, cv.COLOR_RGBA2GRAY, 0);
    // Chuyển lại về 4 kênh để imshow hiển thị đúng (ảnh xám hiển thị như RGB xám)
    let dst4 = new cv.Mat();
    cv.cvtColor(dst, dst4, cv.COLOR_GRAY2RGBA, 0);
    dst.delete();
    return dst4;
  } else if (currentColorSpace === 'HSV') {
    cv.cvtColor(srcMat, dst, cv.COLOR_RGBA2RGB, 0);
    let hsv = new cv.Mat();
    cv.cvtColor(dst, hsv, cv.COLOR_RGB2HSV, 0);
    dst.delete();
    let hsv4 = new cv.Mat();
    cv.cvtColor(hsv, hsv4, cv.COLOR_RGB2RGBA, 0);
    hsv.delete();
    return hsv4;
  } else if (currentColorSpace === 'LAB') {
    cv.cvtColor(srcMat, dst, cv.COLOR_RGBA2RGB, 0);
    let lab = new cv.Mat();
    cv.cvtColor(dst, lab, cv.COLOR_RGB2Lab, 0);
    dst.delete();
    let lab4 = new cv.Mat();
    cv.cvtColor(lab, lab4, cv.COLOR_RGB2RGBA, 0);
    lab.delete();
    return lab4;
  }
  return srcMat.clone();
}

// ---------------------------------------------------------------
// 5. MODULE: CROP & RESIZE
// ---------------------------------------------------------------
resizeSlider.addEventListener('input', () => {
  resizeValue.textContent = `${resizeSlider.value}%`;
  renderOutput();
});

btnCrop.addEventListener('click', () => {
  if (!dragCurrent || !dragStart) return;
  const rect = computeImageRectFromDrag();
  if (rect && rect.w > 2 && rect.h > 2) {
    cropRect = rect;
    drawings = []; // crop làm thay đổi hệ toạ độ, xoá các nét vẽ cũ cho nhất quán
    cropBoxEl.hidden = true;
    renderOutput();
  }
});

btnResetCrop.addEventListener('click', () => {
  cropRect = null;
  drawings = [];
  cropBoxEl.hidden = true;
  renderOutput();
});

// Quy đổi toạ độ kéo chuột (hiển thị trên canvas) -> toạ độ ảnh gốc thật
function computeImageRectFromDrag() {
  const canvasRect = canvasSource.getBoundingClientRect();
  const scaleX = canvasSource.width / canvasRect.width;
  const scaleY = canvasSource.height / canvasRect.height;

  let x1 = (dragStart.x - canvasRect.left) * scaleX;
  let y1 = (dragStart.y - canvasRect.top) * scaleY;
  let x2 = (dragCurrent.x - canvasRect.left) * scaleX;
  let y2 = (dragCurrent.y - canvasRect.top) * scaleY;

  const x = Math.max(0, Math.min(x1, x2));
  const y = Math.max(0, Math.min(y1, y2));
  const w = Math.min(canvasSource.width, Math.abs(x2 - x1));
  const h = Math.min(canvasSource.height, Math.abs(y2 - y1));

  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

// ---------------------------------------------------------------
// 6. MODULE: VẼ HÌNH & CHỮ
// ---------------------------------------------------------------
drawToolButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  currentDrawTool = btn.dataset.tool;
  [...drawToolButtons.children].forEach((c) => c.classList.toggle('active', c === btn));
});

btnAddText.addEventListener('click', () => {
  const text = textInput.value.trim();
  if (!text) return;

  // Chèn text ở vị trí mặc định (góc trên-trái, lệch xuống một chút), người dùng có thể chèn nhiều lần
  drawings.push({
    type: 'text',
    x: 20,
    y: 20 + drawings.filter((d) => d.type === 'text').length * 36,
    text,
    color: drawColor.value,
    thickness: parseInt(drawThickness.value, 10),
  });
  textInput.value = '';
  renderOutput();
});

btnClearDraw.addEventListener('click', () => {
  drawings = [];
  renderOutput();
});

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function applyDrawings(mat) {
  // Vẽ trực tiếp (in-place) tất cả các nét đã lưu trong `drawings` lên `mat`
  drawings.forEach((d) => {
    const { r, g, b } = hexToRgb(d.color);
    const color = new cv.Scalar(r, g, b, 255);

    if (d.type === 'line') {
      cv.line(mat, new cv.Point(d.x1, d.y1), new cv.Point(d.x2, d.y2), color, d.thickness, cv.LINE_AA);
    } else if (d.type === 'circle') {
      cv.circle(mat, new cv.Point(d.cx, d.cy), d.radius, color, d.thickness, cv.LINE_AA);
    } else if (d.type === 'rect') {
      cv.rectangle(mat, new cv.Point(d.x1, d.y1), new cv.Point(d.x2, d.y2), color, d.thickness, cv.LINE_AA);
    } else if (d.type === 'text') {
      cv.putText(mat, d.text, new cv.Point(d.x, d.y), cv.FONT_HERSHEY_SIMPLEX, 0.9, color, Math.max(1, Math.round(d.thickness / 2)), cv.LINE_AA);
    }
  });
}

// ---------------------------------------------------------------
// 7. MOUSE INTERACTION trên canvasSource (dùng chung cho Crop & Draw)
// ---------------------------------------------------------------
canvasSource.addEventListener('mousedown', (e) => {
  if (!hasImage) return;
  if (currentTab !== 'croprezise' && currentTab !== 'draw') return;
  isDragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  dragCurrent = { x: e.clientX, y: e.clientY };
  if (currentTab === 'croprezise') {
    cropBoxEl.hidden = false;
    updateCropBoxVisual();
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  dragCurrent = { x: e.clientX, y: e.clientY };
  if (currentTab === 'croprezise') {
    updateCropBoxVisual();
  }
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;

  if (currentTab === 'draw' && dragStart && dragCurrent) {
    const rect = computeImageRectFromDrag();
    if (rect.w > 2 || rect.h > 2) {
      addShapeFromDrag(rect);
    }
  }
});

function updateCropBoxVisual() {
  const canvasRect = canvasSource.getBoundingClientRect();
  const wrapRect = sourceWrap.getBoundingClientRect();

  const left = Math.min(dragStart.x, dragCurrent.x) - wrapRect.left;
  const top = Math.min(dragStart.y, dragCurrent.y) - wrapRect.top;
  const w = Math.abs(dragCurrent.x - dragStart.x);
  const h = Math.abs(dragCurrent.y - dragStart.y);

  cropBoxEl.style.left = `${left}px`;
  cropBoxEl.style.top = `${top}px`;
  cropBoxEl.style.width = `${w}px`;
  cropBoxEl.style.height = `${h}px`;
}

function addShapeFromDrag(rect) {
  const color = drawColor.value;
  const thickness = parseInt(drawThickness.value, 10);

  if (currentDrawTool === 'line') {
    drawings.push({
      type: 'line',
      x1: rect.x, y1: rect.y,
      x2: rect.x + rect.w, y2: rect.y + rect.h,
      color, thickness,
    });
  } else if (currentDrawTool === 'rect') {
    drawings.push({
      type: 'rect',
      x1: rect.x, y1: rect.y,
      x2: rect.x + rect.w, y2: rect.y + rect.h,
      color, thickness,
    });
  } else if (currentDrawTool === 'circle') {
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const radius = Math.max(rect.w, rect.h) / 2;
    drawings.push({ type: 'circle', cx, cy, radius, color, thickness });
  }
  renderOutput();
}

// ---------------------------------------------------------------
// 8. RENDER PIPELINE CHÍNH (Output canvas)
// ---------------------------------------------------------------
function renderOutput() {
  if (!hasImage || !cvReady) return;

  let src = cv.imread(imgSrc);
  let working = src;

  // Bước 1: Crop nếu có vùng được chọn
  if (cropRect && cropRect.w > 0 && cropRect.h > 0) {
    const safeRect = clampRectToMat(cropRect, src);
    let roi = src.roi(safeRect);
    working = roi.clone();
    roi.delete();
  } else {
    working = src.clone();
  }

  // Bước 2: Resize theo slider (chỉ áp dụng ở tab crop/resize, nhưng giữ nguyên tỉ lệ hiện tại luôn để nhất quán)
  const scale = parseInt(resizeSlider.value, 10) / 100;
  if (scale !== 1) {
    let resized = new cv.Mat();
    const newW = Math.max(1, Math.round(working.cols * scale));
    const newH = Math.max(1, Math.round(working.rows * scale));
    cv.resize(working, resized, new cv.Size(newW, newH), 0, 0, cv.INTER_AREA);
    working.delete();
    working = resized;
  }

  // Bước 3: Áp dụng không gian màu
  let colored = applyColorSpace(working);
  working.delete();

  // Bước 4: Vẽ các hình/chữ đã thêm (vẽ theo toạ độ ảnh GỐC trước crop/resize hiện tại đã đổi,
  // nên ta vẽ lên `colored` — chấp nhận giới hạn: toạ độ vẽ chỉ chính xác khi chưa resize/crop sau khi vẽ)
  applyDrawings(colored);

  cv.imshow('canvasOutput', colored);

  src.delete();
  colored.delete();
}

function clampRectToMat(rect, mat) {
  const x = Math.max(0, Math.min(rect.x, mat.cols - 1));
  const y = Math.max(0, Math.min(rect.y, mat.rows - 1));
  const w = Math.max(1, Math.min(rect.w, mat.cols - x));
  const h = Math.max(1, Math.min(rect.h, mat.rows - y));
  return new cv.Rect(x, y, w, h);
}
