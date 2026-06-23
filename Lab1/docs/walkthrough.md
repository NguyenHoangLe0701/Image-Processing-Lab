# Đã Hoàn Thành Image Basics Studio

Ứng dụng Image Basics Studio đã được xây dựng thành công trong thư mục `web/`. Đây là một ứng dụng Web với giao diện Dark Mode, thiết kế theo phong cách Glassmorphism (Kính mờ), trực quan hóa các thao tác xử lý ảnh cơ bản của Chương 1.

## Các tính năng nổi bật:

1. **Tải ảnh & xem trực tiếp**: Người dùng chọn một ảnh bất kỳ từ máy, ảnh gốc hiển thị ngay trên canvas.
2. **Chuyển đổi không gian màu tức thì**: Bấm nút để xem ảnh ở dạng RGB / Grayscale / HSV / LAB, so sánh trực quan sự khác biệt.
3. **Crop & Resize tương tác**: Kéo chuột để chọn vùng cắt, kéo thanh trượt để resize theo tỉ lệ — kết quả cập nhật ngay.
4. **Công cụ vẽ hình & chữ**: Vẽ đường thẳng/hình tròn/hình chữ nhật và chèn văn bản lên ảnh, giống các thao tác `cv2.line`, `cv2.circle`, `cv2.putText` đã học trong notebook.
5. **Tiếng Việt 100%**: Giao diện hoàn toàn bằng tiếng Việt để sinh viên dễ dàng làm quen.

---

## Cách trải nghiệm ngay trên máy tính của bạn

Hiện tại, tôi đã khởi động sẵn server cục bộ (Vite Dev Server). Bạn có thể mở trình duyệt và truy cập vào đường link sau để xem thành quả ngay lập tức:

**[http://localhost:5173/](http://localhost:5173/)**

> [!NOTE]
> Khác với lab Canny (Chương 2) cần quyền Camera, Web App này chỉ cần bạn **tải lên một tấm ảnh** từ máy — không cần xin quyền gì cả. Quá trình tải thư viện lõi OpenCV.js (tầm 1-2 giây) sẽ hiển thị màn hình chờ (Loading) xoay tròn.

---

## Hướng dẫn Dploy lên Vercel cho buổi thuyết trình

Để các bạn sinh viên ngồi dưới có thể dùng điện thoại truy cập vào app của bạn, bạn cần đưa thư mục `web` này lên mạng thông qua Vercel.

**Cách làm cực kỳ đơn giản (Miễn phí hoàn toàn):**

1. Bạn tạo một tài khoản GitHub (nếu chưa có).
2. Tạo một repository mới trên GitHub và upload thư mục `web` của Lab1 lên đó.
3. Đăng nhập vào **[Vercel.com](https://vercel.com/)** bằng tài khoản GitHub của bạn.
4. Chọn **Add New Project**, chọn Repository bạn vừa tạo trên GitHub.
5. Vercel sẽ tự động nhận diện đây là dự án Vite. Bạn chỉ việc nhấn nút **Deploy**.
6. Chỉ mất 10 giây, Vercel sẽ cấp cho bạn một đường link public (Ví dụ: `https://image-basics-studio.vercel.app`).
7. **Bí kíp thuyết trình**: Bạn lên trang web tạo QR Code (như qrcode-monkey.com), tạo một mã QR từ đường link Vercel kia. Chèn mã QR khổng lồ này vào 1 slide PowerPoint ở cuối giờ để khán giả tự trải nghiệm.
