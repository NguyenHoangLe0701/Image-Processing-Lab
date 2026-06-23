# Phát Biểu Bài Toán: Web App Image Basics Studio

---

## 1. Tổng Quan Dự Án Web
**Tên dự án:** Image Basics Studio
**Mục tiêu:** Xây dựng một ứng dụng web (chạy hoàn toàn trên trình duyệt) để minh họa trực quan các thao tác xử lý ảnh cơ bản của Chương 1: chuyển đổi không gian màu, cắt xén/thay đổi kích thước, và vẽ hình/chữ lên ảnh. Cho phép người dùng thao tác và thấy ngay kết quả theo thời gian thực.

---

## 2. Bối Cảnh & Lý Do Tích Hợp Web App
Bài tập thực hành truyền thống viết code trên Jupyter Notebook giúp hiểu cú pháp OpenCV/Pillow, nhưng người học khó hình dung trực quan sự khác biệt giữa các không gian màu, hay hiệu ứng của crop/resize khi thay đổi tham số liên tục. Do đó, nhóm xây dựng thêm Web App "Interactive Demo" nhằm tăng tính trực quan, hỗ trợ ôn tập và báo cáo sinh động hơn.

---

## 3. Đầu Vào (Input)
- **Tải ảnh:** Chọn ảnh từ thiết bị (PC/Mobile).
- **Lựa chọn không gian màu:** Nút chuyển đổi giữa RGB (gốc), Grayscale, HSV, LAB.
- **Tham số Crop/Resize:**
  - Kéo-thả vùng chọn (crop box) trên ảnh gốc.
  - Thanh trượt (Slider) tỉ lệ resize (%).
- **Tham số vẽ hình:**
  - Chọn loại hình: Đường thẳng / Hình tròn / Hình chữ nhật.
  - Ô nhập văn bản chèn lên ảnh.
  - Bộ chọn màu (color picker) cho nét vẽ.

---

## 4. Đầu Ra (Output)
- **Hiển thị:** Khung hình (Canvas) hiển thị kết quả ảnh đã qua biến đổi, cập nhật lập tức sau mỗi thao tác.
- **Hiệu năng:** Kết xuất nhanh, không giật lag, vì chỉ xử lý ảnh tĩnh (không phải video real-time).

---

## 5. Kiến Trúc & Luồng Dữ Liệu
**Mô hình Client-Side Processing (Không có Backend):**
1. Trình duyệt tải `index.html`, `style.css`, `main.js` và thư viện `OpenCV.js`.
2. Trình duyệt yêu cầu người dùng chọn ảnh từ thiết bị.
3. `OpenCV.js` (chạy trên WebAssembly) lấy dữ liệu pixel từ ảnh đã tải.
4. Áp dụng các hàm: `cv.cvtColor()`, `cv.resize()`, ROI cắt ảnh (`cv.Mat.roi()`), `cv.line()/cv.circle()/cv.rectangle()/cv.putText()`.
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
- ❌ **Không xử lý Camera/Video real-time:** Phạm vi Chương 1 chỉ là ảnh tĩnh; tính năng Camera được dành cho lab Chương 2 (Canny Edge Studio).
- ❌ **Không triển khai đa thuật toán nâng cao:** Ứng dụng chỉ tập trung vào các thao tác cơ bản (đổi không gian màu, crop/resize, vẽ hình/chữ), không sa đà làm Photoshop web.

---

## 8. Tiêu Chí Hoàn Thành (Definition of Done)
- [ ] Giao diện Web hiển thị tốt trên cả Máy tính và Điện thoại di động (Responsive).
- [ ] Người dùng tải được ảnh lên và web hiển thị ảnh gốc.
- [ ] Chuyển đổi không gian màu (Grayscale/HSV/LAB) cập nhật ngay khi chọn.
- [ ] Cắt xén & resize ảnh hoạt động và hiển thị đúng kết quả.
- [ ] Vẽ hình cơ bản và chèn văn bản lên ảnh hoạt động đúng.
- [ ] Ứng dụng chạy mượt mà, không crash trình duyệt.
