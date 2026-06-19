# Kế Hoạch Triển Khai Chi Tiết (Implementation Plan): Canny Edge Detector & Studio

> [!IMPORTANT]  
> **AI HANDOFF PROMPT**  
> *Copy đoạn văn bản dưới đây và gửi cho một trợ lý AI khác (ChatGPT, Claude, v.v.) để nó hiểu toàn bộ bối cảnh và code lại/bảo trì dự án này với cấu trúc giống 100%.*  
>   
> **Context:** Bạn là một chuyên gia Thị giác Máy tính (Computer Vision). Nhiệm vụ của bạn là xây dựng lại dự án "Canny Edge Detector". Dự án này gồm 2 mảng chính:  
> 1. **Jupyter Notebooks (Bài tập Python):** Dùng thư viện `cv2`, `skimage`, `numpy`, `matplotlib`. Chia làm 3 phần:  
>    - Phần 1: Phân tích lý thuyết 5 bước của Canny (Gaussian, Gradient, NMS, Double Threshold, Hysteresis) và so sánh với Sobel/Laplacian.  
>    - Phần 2: Code thực hành `cv2.Canny` và `skimage.feature.canny`. Xử lý nhiễu bằng Blur, ảnh tương phản thấp bằng Histogram Equalization.  
>    - Phần 3: Chạy Canny trên từng kênh ảnh màu RGB (`cv2.split`), chạy Canny trên luồng video bằng `cv2.VideoCapture` theo từng frame, và đánh giá chất lượng cạnh bằng chỉ số SSIM.  
> 2. **Web App (Canny Edge Studio):** Viết bằng HTML/JS thuần và build bằng Vite. Kiến trúc Client-side Rendering hoàn toàn.  
>    - **Thư viện:** Bắt buộc dùng WebAssembly `opencv.js` đặt ở public.  
>    - **Giao diện:** Dark-mode. Chia làm ảnh gốc và Canvas kết quả. Có 2 sliders chỉnh `Threshold Low` và `Threshold High`.  
>    - **Luồng Video:** Dùng `navigator.mediaDevices.getUserMedia`, đưa luồng vào thẻ `<video>` ẩn. Tạo vòng lặp render ~30FPS bằng `requestAnimationFrame` để xuất frame -> `cv.imread` -> Canny -> `cv.imshow` ra `<canvas>`.  
>    - **Lưu ý Memory Leak:** Phải gọi `.delete()` trên các ma trận `cv.Mat()` ngay sau khi xử lý xong mỗi frame để tránh crash trình duyệt.  
>   
> Vui lòng bám sát tài liệu hướng dẫn kỹ thuật chi tiết dưới đây để triển khai.

---

## 1. Mục Đích Tài Liệu
Tài liệu này cung cấp một kế hoạch triển khai cực kỳ chi tiết, vạch ra các bước thực hiện, cơ sở lý thuyết, và kỹ thuật lập trình (Python & JavaScript) để hoàn thành bài thực hành "Canny Edge Detector". Kế hoạch bao gồm 2 phần chính:
1. **Dự án Sinh viên (Jupyter Notebooks):** Báo cáo học thuật về thuật toán Canny (Phần 1, 2, 3).
2. **Dự án Mở rộng (Canny Edge Studio Web App):** Ứng dụng thực tế chứng minh tính ứng dụng của thuật toán Canny bằng WebAssembly (OpenCV.js).

---

## 2. Cấu Trúc Toàn Bộ Dự Án

```text
Lab2_Part2/
├── 📓 Phan1_LyThuyet_Canny.ipynb    # Phần I: Lý thuyết & Cơ sở toán học
├── 📓 Phan2_ThucHanh_Canny.ipynb    # Phần II: Thực hành bằng Python & OpenCV/Skimage
├── 📓 Phan3_MoRong.ipynb            # Phần III: Nghiên cứu chuyên sâu (Ảnh màu, Video, Metrics)
├── 📓 Canny_Edge_Detector.ipynb     # File notebook tổng hợp để submit
├── docs/                            
│   ├── problem_definition.md        
│   └── implement_plan.md            # (File này)
├── data/input/                      # Thư mục lưu ảnh thử nghiệm
└── web/                             # Mã nguồn Web App Canny Edge Studio
    ├── index.html                   
    ├── style.css                    
    ├── main.js                      
    ├── package.json                 
    └── public/opencv.js             
```

---

## 3. Giai Đoạn 1: Giải Quyết Bài Tập Lý Thuyết (Phần 1)

**Tệp tin thực hiện:** `Phan1_LyThuyet_Canny.ipynb`

### 3.1. Phân Tích 5 Bước Thuật Toán Canny
- **Bước 1: Gaussian Smoothing.** Làm mịn ảnh bằng kernel Gaussian 2D để giảm nhiễu (công thức: $G(x, y) = \frac{1}{2\pi\sigma^2} e^{-\frac{x^2 + y^2}{2\sigma^2}}$).
- **Bước 2: Gradient Computation.** Dùng toán tử Sobel tính cường độ gradient (Magnitude) và hướng (Direction, làm tròn về 0°, 45°, 90°, 135°).
- **Bước 3: Non-Maximum Suppression (NMS).** Triệt tiêu các pixel không phải cực đại dọc theo hướng gradient để làm mỏng cạnh (1 pixel).
- **Bước 4: Double Thresholding.** Phân loại cạnh mạnh (Strong edge) nếu $> T_{high}$, cạnh yếu (Weak edge) nếu nằm giữa $T_{low}$ và $T_{high}$.
- **Bước 5: Hysteresis Tracking.** Loại bỏ cạnh yếu nếu không kết nối với cạnh mạnh qua duyệt đồ thị lân cận 8 pixel.

### 3.2. So Sánh và Đánh Giá
- **So sánh thuật toán:** So sánh Canny với các bộ lọc đạo hàm bậc 1 (Sobel, Prewitt) và bậc 2 (Laplacian). Đánh giá độ chính xác, xử lý nhiễu, và tốc độ.
- **Phân tích tham số:** Khảo sát ảnh hưởng của Sigma $\sigma$ (kích thước làm mịn) và tỷ lệ ngưỡng $T_{high}:T_{low}$ (khuyến nghị 2:1 hoặc 3:1).
- **Tính ứng dụng:** Mô tả ứng dụng thực tế (Xe tự lái, y tế, kiểm tra công nghiệp bề mặt).

---

## 4. Giai Đoạn 2: Thực Hành Lập Trình (Phần 2)

**Tệp tin thực hiện:** `Phan2_ThucHanh_Canny.ipynb`

### 4.1. Thiết Lập Môi Trường & Hàm Tiện Ích
- **Thư viện:** `cv2` (OpenCV), `numpy` (Ma trận), `matplotlib.pyplot` (Biểu đồ), `skimage.feature` (Canny của Skimage).
- **Hàm hỗ trợ:** Viết hàm `show_images` để in grid ảnh chuẩn xác (chuyển BGR sang RGB). Viết hàm `print_edge_stats` thống kê phần trăm pixel cạnh.

### 4.2. Khảo Sát Thuật Toán Cơ Bản
- Triển khai `cv2.Canny(image, T_low, T_high)`.
- Triển khai `skimage.feature.canny(image, sigma, low_threshold, high_threshold)` để so sánh độ kiểm soát tham số $\sigma$.

### 4.3. Xử Lý Tình Huống Hình Ảnh Thực Tế
- **Ảnh nhiễu:** Áp dụng `cv2.medianBlur` hoặc `cv2.GaussianBlur` trước khi Canny để tránh nhiễu muối tiêu hoặc nhiễu Gaussian tạo ra cạnh giả.
- **Ảnh tương phản thấp:** Áp dụng Histogram Equalization (`cv2.equalizeHist`) trước khi tìm cạnh để làm nổi bật đường viền.
- **Kết hợp ứng dụng:** Sử dụng Hough Transform (`cv2.HoughLinesP`) sau bước Canny để phát hiện đoạn thẳng (ví dụ: vạch kẻ đường).

---

## 5. Giai Đoạn 3: Nghiên Cứu Mở Rộng (Phần 3)

**Tệp tin thực hiện:** `Phan3_MoRong.ipynb`

### 5.1. Kỹ Thuật Đánh Giá Chất Lượng Cạnh
- Triển khai định tính: Dựa trên 3 tiêu chí cốt lõi (Low error rate, Good localization, Single response).
- Triển khai định lượng: Tính toán chỉ số SSIM (Structural Similarity Index) thông qua `skimage.metrics.structural_similarity` để so sánh mức độ tương đồng giữa các cấu hình tham số. Tham khảo thêm công thức Pratt's Figure of Merit (PFOM).

### 5.2. Khảo Sát Canny Trên Ảnh Màu
- Mặc định Canny chỉ chạy trên Grayscale. Kế hoạch triển khai trên ảnh màu:
  1. Tách 3 kênh màu (R, G, B) bằng `cv2.split()`.
  2. Áp dụng Canny trên từng kênh riêng biệt.
  3. Hợp nhất kết quả bằng phép toán logic `cv2.bitwise_or`.
  4. Trình bày phương pháp phức tạp hơn như chuyển đổi không gian màu Lab/HSV hoặc tính toán gradient Di Zenzo.

### 5.3. Khảo Sát Canny Trên Luồng Video
- Khởi tạo đối tượng `cv2.VideoCapture()`.
- Tạo vòng lặp đọc từng frame (`cap.read()`).
- Tại mỗi frame: Chuyển xám (`cv2.cvtColor`) -> Giảm nhiễu (`cv2.GaussianBlur`) -> Tìm cạnh (`cv2.Canny`) -> Hiển thị (`cv2.imshow`).
- Tích hợp thêm Temporal Smoothing để giảm nhấp nháy giữa các khung hình (nếu cần).

---

## 6. Giai Đoạn 4: Triển Khai Web App "Canny Edge Studio"

**Tệp tin thực hiện:** Thư mục `web/`

### 6.1. Kiến Trúc Ứng Dụng
- **Mô hình:** Frontend thuần (Vanilla JS + HTML5 + CSS3) chạy trên trình duyệt, không có máy chủ xử lý ảnh.
- **Engine Xử Lý Ảnh:** Sử dụng `opencv.js` (Bản build WebAssembly của OpenCV C++) đặt trong thư mục `public/`.
- **Bundler:** Sử dụng `Vite` để phục vụ hot-reloading và build tĩnh (`vite.config.js`).

### 6.2. Thiết Kế Giao Diện (`index.html` & `style.css`)
- Layout Dark-mode chuyên nghiệp.
- Cấu trúc: 
  - Khung tải ảnh (`<input type="file">`).
  - Nút Mở Camera (`<button id="startCamera">`).
  - Thanh Slider điều khiển cấu hình: `Threshold Low` và `Threshold High`.
  - Phân vùng hiển thị: `Original View` (Video/Img ẩn hoặc hiện) và `Canny Edge View` (`<canvas id="canvasOutput">`).

### 6.3. Xử Lý Logic JavaScript (`main.js`)
- **Khởi tạo & Đồng bộ OpenCV:**
  - Lắng nghe callback `cv['onRuntimeInitialized']` để bỏ màn hình chờ (Loading Spinner), báo hiệu Wasm đã sẵn sàng.
- **Quy trình Xử lý Ảnh Tĩnh (Static Image):**
  1. Đọc tệp, gán URL vào DOM `<img>`.
  2. Tạo biến lưu trữ: `let src = cv.imread('imageId'); let dst = new cv.Mat();`.
  3. Áp dụng luồng xử lý: `cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)` -> `cv.Canny(src, dst, tLow, tHigh, 3, false)`.
  4. Đổ dữ liệu ra Canvas: `cv.imshow('canvasOutput', dst)`.
  5. **Bảo mật bộ nhớ:** Chạy `.delete()` cho `src` và `dst` để dọn dẹp C++ memory heap.
- **Quy trình Xử lý Camera Thời Gian Thực (Realtime Video):**
  1. Gọi API `navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })` để xin quyền.
  2. Map luồng stream vào thẻ `<video>`.
  3. Sử dụng `requestAnimationFrame` tạo vòng lặp render (~30fps).
  4. Lấy khung hình -> `cv.imread` -> Canny -> `cv.imshow`.
  5. Liên tục bắt sự kiện `.addEventListener('input', ...)` trên các Sliders để cập nhật mức `tLow`, `tHigh` truyền thẳng vào luồng đang lặp.

---

## 7. Tổng Kết & Giao Nộp Bài
1. Khởi động lại Kernel Jupyter và **Run All** các notebook 1, 2, 3 để đảm bảo không lỗi Execution.
2. Gộp cell từ 3 notebook vào tệp `Canny_Edge_Detector.ipynb` hoàn chỉnh.
3. Chạy `npm run dev` trong thư mục `web/` để test lại hệ thống Vite/OpenCV.js lần cuối.
4. Nén toàn bộ mã nguồn (.zip) và gửi báo cáo cho Giảng viên.
