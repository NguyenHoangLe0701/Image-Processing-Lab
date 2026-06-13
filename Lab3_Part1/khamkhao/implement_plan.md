# Kế Hoạch Triển Khai: Canny Edge Studio

---

## 1. Mục Đích Tài Liệu
Tài liệu này vạch ra các bước thực hiện cụ thể để xây dựng ứng dụng Web "Canny Edge Studio" theo đúng giới hạn phạm vi (Scope) đã định trong file `problem_definition.md`. Tài liệu này giúp Giảng viên nắm được khối lượng công việc nhóm đã thực hiện ở phần mở rộng này.

---

## 2. Cấu Trúc Thư Mục Web App

Toàn bộ Source Code của ứng dụng được đặt gói gọn trong thư mục `web/` để tách biệt khỏi file bài tập báo cáo Jupyter Notebook.

```
Lab2_Part2/
└── web/
    ├── index.html            # Khung xương HTML chứa giao diện, canvas
    ├── style.css             # Định dạng giao diện (Dark mode chuyên nghiệp)
    ├── main.js               # Logic điều khiển, đọc ảnh/video và xử lý sự kiện
    ├── vite.config.js        # Cấu hình môi trường dev server cục bộ
    ├── package.json          # Quản lý script khởi chạy và thư viện npm (vite)
    └── public/
        └── opencv.js         # Thư viện OpenCV phiên bản WebAssembly
```

---

## 3. Các Luồng Thực Thi (Execution Flows)

### 3.1. Khởi Tạo & Load OpenCV
Vì `opencv.js` có dung lượng khá lớn, luồng xử lý ban đầu:
- Trang HTML tải xong sẽ hiển thị vòng xoay "Đang tải thư viện..."
- Hàm `cv['onRuntimeInitialized']` kích hoạt khi `opencv.js` sẵn sàng.
- Ẩn vòng xoay tải, hiện giao diện chính cho người dùng.

### 3.2. Luồng Xử Lý Ảnh Tĩnh (Image Upload)
1. Bắt sự kiện `change` trên thẻ `<input type="file">`.
2. Đọc file qua `FileReader` và gán vào một `<img id="imageSrc">` ẩn.
3. Chuyển `img` thành định dạng ma trận của OpenCV: `let src = cv.imread('imageSrc');`.
4. Khởi tạo ma trận `dst` (chứa kết quả), chuyển ảnh sang Grayscale: `cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);`.
5. Áp dụng Canny: `cv.Canny(src, dst, threshold1, threshold2, 3, false);`.
6. Hiển thị ma trận `dst` ra `<canvas>`: `cv.imshow('canvasOutput', dst);`.
7. Giải phóng bộ nhớ (`src.delete()`, `dst.delete()`).

### 3.3. Luồng Xử Lý Camera Trực Tiếp (Video Stream)
1. Dùng `navigator.mediaDevices.getUserMedia({ video: true })` xin quyền Camera.
2. Đưa luồng stream vào thẻ `<video>` ẩn.
3. Dùng `requestAnimationFrame` tạo vòng lặp liên tục bóc tách từng Frame.
4. Ở mỗi Frame, gọi `cv.imread(video)`, áp dụng thuật toán `Canny` tương tự như xử lý ảnh tĩnh.
5. In ra Canvas. Quá trình lặp lại ~30 lần/giây để tạo hiệu ứng realtime.

---

## 4. Thứ Tự Implement (Roadmap)

| Giai đoạn | Nhiệm vụ | Chi tiết | Tình trạng |
| :--- | :--- | :--- | :---: |
| **Giai đoạn 1** | **Setup Project** | - Khởi tạo bằng `npm create vite`.<br>- Xóa các file thừa, giữ lại HTML/JS/CSS cơ bản.<br>- Tải và nhúng file `opencv.js` vào thư mục public. | ✅ Xong |
| **Giai đoạn 2** | **Xây Dựng Giao Diện** | - Tạo layout chia 2 cột: Ảnh gốc & Kết quả Canny.<br>- Thêm các nút "Tải ảnh", "Mở Camera".<br>- Thêm 2 thanh slider điều chỉnh T_low và T_high. | ✅ Xong |
| **Giai đoạn 3** | **Tích Hợp OpenCV** | - Viết hàm đọc ảnh gốc.<br>- Gọi `cv.Canny` và hiển thị kết quả lên Canvas. | ✅ Xong |
| **Giai đoạn 4** | **Bắt Sự Kiện (Events)**| - Lắng nghe sự kiện `input` trên 2 thanh slider để gọi lại hàm tính Canny lập tức. | ✅ Xong |
| **Giai đoạn 5** | **Tích Hợp Camera** | - Xin quyền Camera và loop frame kết hợp Canny. | ✅ Xong |

---

## 5. Những Điểm Lăn Tăn (Thách Thức Kỹ Thuật Gặp Phải)

1. **Rò rỉ bộ nhớ (Memory Leak) với OpenCV.js:** Trong JS, garbage collector tự động giải phóng bộ nhớ, nhưng `opencv.js` thao tác qua WebAssembly nên bộ nhớ c++ không tự giải phóng. **Giải pháp:** Cực kỳ cẩn trọng gọi phương thức `.delete()` cho mọi biến ảnh `cv.Mat()` sau khi render xong, đặc biệt trong vòng lặp Camera xử lý 30 frames/giây.
2. **Hiệu năng Camera:** Quá trình Canny trên độ phân giải Full HD (1080p) làm trình duyệt bị giật. **Giải pháp:** Giới hạn luồng video ở độ phân giải 640x480 pixel trước khi đưa vào hàm xử lý.

---

## 6. Hướng Dẫn Chạy & Kiểm Tra
- **Môi trường yêu cầu:** Cài sẵn Node.js (bản 18+).
- **Lệnh chạy:**
  ```bash
  cd web
  npm install
  npm run dev
  ```
- Trình duyệt sẽ mở tại `http://localhost:5173`. Tính năng "Camera" yêu cầu môi trường localhost hoặc có chứng chỉ HTTPS. Môi trường local hoàn toàn đáp ứng được.
