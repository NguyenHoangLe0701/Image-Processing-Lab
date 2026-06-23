# Kế Hoạch Triển Khai: Image Basics Studio

---

## 1. Mục Đích Tài Liệu
Tài liệu này vạch ra các bước thực hiện cụ thể để xây dựng ứng dụng Web "Image Basics Studio" theo đúng giới hạn phạm vi (Scope) đã định trong file `problem_definition.md`. Tài liệu này giúp Giảng viên nắm được khối lượng công việc nhóm đã thực hiện ở phần mở rộng này.

---

## 2. Cấu Trúc Thư Mục Web App

Toàn bộ Source Code của ứng dụng được đặt gói gọn trong thư mục `web/` để tách biệt khỏi file bài tập báo cáo Jupyter Notebook.

```
Lab1/
└── web/
    ├── index.html            # Khung xương HTML chứa giao diện, canvas
    ├── style.css              # Định dạng giao diện (Dark mode chuyên nghiệp)
    ├── main.js                # Logic điều khiển, đọc ảnh và xử lý sự kiện
    ├── vite.config.js         # Cấu hình môi trường dev server cục bộ
    ├── package.json           # Quản lý script khởi chạy và thư viện npm (vite)
    └── public/
        └── opencv.js          # Thư viện OpenCV phiên bản WebAssembly
```

---

## 3. Các Luồng Thực Thi (Execution Flows)

### 3.1. Khởi Tạo & Load OpenCV
Vì `opencv.js` có dung lượng khá lớn, luồng xử lý ban đầu:
- Trang HTML tải xong sẽ hiển thị vòng xoay "Đang tải thư viện..."
- Hàm `cv['onRuntimeInitialized']` kích hoạt khi `opencv.js` sẵn sàng.
- Ẩn vòng xoay tải, hiện giao diện chính cho người dùng.

### 3.2. Luồng Đọc & Hiển Thị Ảnh
1. Bắt sự kiện `change` trên thẻ `<input type="file">`.
2. Đọc file qua `FileReader` và gán vào một `<img id="imageSrc">` ẩn.
3. Chuyển `img` thành định dạng ma trận của OpenCV: `let src = cv.imread('imageSrc');`.
4. Hiển thị ảnh gốc lên `<canvas id="canvasOriginal">`: `cv.imshow('canvasOriginal', src);`.

### 3.3. Luồng Chuyển Đổi Không Gian Màu
1. Bắt sự kiện `click` trên các nút chọn không gian màu (RGB/Gray/HSV/LAB).
2. Tạo ma trận `dst` mới: `let dst = new cv.Mat();`.
3. Gọi `cv.cvtColor(src, dst, code, 0)` với `code` tương ứng:
   - `cv.COLOR_RGBA2GRAY` cho Grayscale.
   - `cv.COLOR_RGB2HSV` cho HSV.
   - `cv.COLOR_RGB2Lab` cho LAB.
4. Hiển thị `dst` lên `<canvas id="canvasOutput">`.
5. Giải phóng bộ nhớ (`dst.delete()`).

### 3.4. Luồng Cắt Xén (Crop) & Resize
1. Người dùng kéo-thả để chọn vùng (ROI) trên canvas ảnh gốc bằng sự kiện chuột (`mousedown`, `mousemove`, `mouseup`).
2. Tạo `rect = new cv.Rect(x, y, w, h)` từ tọa độ vùng chọn.
3. Cắt ảnh: `let cropped = src.roi(rect);`.
4. Resize theo tỉ lệ từ slider: `cv.resize(cropped, dst, new cv.Size(newW, newH), 0, 0, cv.INTER_AREA);`.
5. Hiển thị kết quả lên Canvas, giải phóng bộ nhớ các `Mat` trung gian.

### 3.5. Luồng Vẽ Hình & Thêm Văn Bản
1. Người dùng chọn loại hình (line/circle/rectangle) và nhập tọa độ hoặc vẽ trực tiếp bằng chuột trên canvas.
2. Gọi hàm OpenCV.js tương ứng trên một bản sao của ảnh: `cv.line()`, `cv.circle()`, `cv.rectangle()`.
3. Nếu có văn bản nhập vào ô input, gọi `cv.putText(dst, text, point, cv.FONT_HERSHEY_SIMPLEX, 1, color, 2);`.
4. Hiển thị kết quả ra canvas.

---

## 4. Thứ Tự Implement (Roadmap)

| Giai đoạn | Nhiệm vụ | Chi tiết | Tình trạng |
| :--- | :--- | :--- | :---: |
| **Giai đoạn 1** | **Setup Project** | - Khởi tạo bằng `npm create vite`.<br>- Xóa các file thừa, giữ lại HTML/JS/CSS cơ bản.<br>- Tải và nhúng file `opencv.js` vào thư mục public. | ✅ Xong |
| **Giai đoạn 2** | **Xây Dựng Giao Diện** | - Tạo layout chia 2 cột: Ảnh gốc & Kết quả.<br>- Thêm nút "Tải ảnh", các nút chọn không gian màu.<br>- Thêm slider resize và công cụ vẽ hình. | ✅ Xong |
| **Giai đoạn 3** | **Tích Hợp OpenCV** | - Viết hàm đọc ảnh gốc.<br>- Cài đặt chuyển đổi không gian màu và hiển thị kết quả lên Canvas. | ✅ Xong |
| **Giai đoạn 4** | **Bắt Sự Kiện (Events)** | - Lắng nghe sự kiện trên các nút/slider để gọi lại hàm xử lý tương ứng ngay lập tức. | ✅ Xong |
| **Giai đoạn 5** | **Crop & Vẽ Hình** | - Cài đặt kéo-thả chọn vùng crop.<br>- Cài đặt vẽ hình cơ bản và chèn text. | ✅ Xong |

---

## 5. Những Điểm Lăn Tăn (Thách Thức Kỹ Thuật Gặp Phải)

1. **Rò rỉ bộ nhớ (Memory Leak) với OpenCV.js:** Trong JS, garbage collector tự động giải phóng bộ nhớ, nhưng `opencv.js` thao tác qua WebAssembly nên bộ nhớ C++ không tự giải phóng. **Giải pháp:** Cực kỳ cẩn trọng gọi phương thức `.delete()` cho mọi biến ảnh `cv.Mat()` sau khi render xong, đặc biệt là các `Mat` trung gian sinh ra liên tục khi người dùng kéo slider.
2. **Tọa độ vẽ/crop không khớp giữa Canvas hiển thị và ảnh gốc:** Khi ảnh gốc có độ phân giải lớn hơn kích thước hiển thị trên màn hình, tọa độ chuột cần được quy đổi theo tỉ lệ `scaleX = naturalWidth / displayWidth` trước khi truyền vào OpenCV. **Giải pháp:** Luôn tính tỉ lệ quy đổi trước khi tạo `cv.Rect` hoặc `cv.Point`.

---

## 6. Hướng Dẫn Chạy & Kiểm Tra
- **Môi trường yêu cầu:** Cài sẵn Node.js (bản 18+).
- **Lệnh chạy:**
  ```bash
  cd web
  npm install
  npm run dev
  ```
- Trình duyệt sẽ mở tại `http://localhost:5173`.
