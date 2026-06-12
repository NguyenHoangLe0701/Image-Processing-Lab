# Phát Biểu Bài Toán: Web App Canny Edge Studio

---

## 1. Tổng Quan Dự Án Web
**Tên dự án:** Canny Edge Studio  
**Mục tiêu:** Xây dựng một ứng dụng web (chạy hoàn toàn trên trình duyệt) để minh họa trực quan thuật toán Canny. Cho phép người dùng điều chỉnh các tham số theo thời gian thực (Real-time) và thấy ngay sự thay đổi của các đường viền.

---

## 2. Bối Cảnh & Lý Do Tích Hợp Web App
Bài tập thực hành truyền thống chủ yếu viết code trên Jupyter Notebook, tuy nhiên người dùng khó cảm nhận được sự thay đổi liên tục của các tham số (Threshold, Sigma). Do đó, nhóm quyết định làm thêm một Web App nhỏ dạng "Interactive Demo" nhằm tăng tính trực quan, giúp quá trình báo cáo và bảo vệ đồ án thêm sinh động.

---

## 3. Đầu Vào (Input)
- **Tải ảnh:** Chọn ảnh từ thiết bị (PC/Mobile).
- **Camera trực tiếp:** Mở Webcam trên máy tính hoặc Camera trên điện thoại để xử lý video stream theo thời gian thực.
- **Tham số Canny:** Các thanh trượt (Sliders) để tinh chỉnh:
  - Ngưỡng thấp (Low Threshold)
  - Ngưỡng cao (High Threshold)
  - (Tùy chọn) Kích thước bộ lọc Gaussian / Aperture size.

---

## 4. Đầu Ra (Output)
- **Hiển thị:** Khung hình (Canvas) hiển thị kết quả viền (Edge) trắng đen được tính toán lập tức sau mỗi lần đổi tham số hoặc ở mỗi khung hình video.
- **Hiệu năng:** Kết xuất nhanh, không giật lag.

---

## 5. Kiến Trúc & Luồng Dữ Liệu
**Mô hình Client-Side Processing (Không có Backend):**
1. Trình duyệt tải `index.html`, `style.css`, `main.js` và thư viện `OpenCV.js`.
2. Trình duyệt xin quyền truy cập Camera (hoặc yêu cầu chọn ảnh).
3. `OpenCV.js` (chạy trên WebAssembly) lấy dữ liệu pixel từ khung hình ảnh/video.
4. Áp dụng hàm `cv.Canny()`.
5. Đẩy kết quả ngược lại lên thẻ `<canvas>` HTML.

---

## 6. Công Nghệ Sử Dụng
- **Giao diện:** HTML5, CSS3.
- **Logic & Tương tác:** Vanilla JavaScript (ES6).
- **Core Xử Lý Ảnh:** `OpenCV.js` (Phiên bản OpenCV dịch sang WebAssembly để chạy trên trình duyệt).
- **Môi trường phát triển & Build:** Vite (để serve web server cục bộ ở môi trường dev).

---

## 7. Phạm Vi Ngoài Dự Án (Out of Scope) - GIỚI HẠN PHẠM VI
Để đảm bảo trọng tâm vẫn là môn "Xử lý ảnh" chứ không biến thành đồ án "Lập trình Web", dự án web tuân thủ nghiêm ngặt giới hạn sau:
- ❌ **Không có Backend / Server:** Mọi thao tác xử lý ảnh diễn ra tại trình duyệt của người dùng (Client-side). Không cần thuê server xử lý.
- ❌ **Không Database / Lưu trữ:** Không lưu thông tin người dùng, không có đăng nhập, không lưu lại ảnh đã xử lý hay lịch sử thao tác.
- ❌ **Không triển khai đa thuật toán:** Ứng dụng chỉ tập trung DUY NHẤT vào thuật toán Canny, không sa đà làm Photoshop web.

---

## 8. Tiêu Chí Hoàn Thành (Definition of Done)
- [ ] Giao diện Web hiển thị tốt trên cả Máy tính và Điện thoại di động (Responsive).
- [ ] Người dùng tải được ảnh lên và web hiện kết quả Canny.
- [ ] Tích hợp được Camera thời gian thực.
- [ ] Khi kéo thanh trượt (Threshold 1, Threshold 2), ảnh Canny cập nhật ngay lập tức mà không cần bấm nút Submit.
- [ ] Ứng dụng chạy mượt mà, không crash trình duyệt.
