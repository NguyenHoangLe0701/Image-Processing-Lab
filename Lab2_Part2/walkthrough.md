# 🚀 Đã Hoàn Thành Canny Web App

Ứng dụng Canny Web App trực tiếp đã được xây dựng thành công trong thư mục `web/`. Đây là một ứng dụng Web chuyên nghiệp với giao diện Dark Mode, thiết kế theo phong cách Glassmorphism (Kính mờ) rất phù hợp để trình diễn AI/Thị giác máy tính.

## 🌟 Các tính năng nổi bật:
1. **Live Camera (Thời gian thực)**: Ứng dụng sẽ xin quyền mở Camera điện thoại/Laptop của người dùng và nhận diện cạnh Canny liên tục ở khung hình thực tế.
2. **Giao diện hiện đại (Glassmorphism)**: Các bảng điều khiển mờ ảo đẹp mắt không che lấp tầm nhìn của Camera.
3. **Thanh trượt mượt mà (Interactive Sliders)**: Cho phép khán giả kéo thanh trượt để thay đổi mức độ Làm mờ (Blur), Ngưỡng thấp (T_low) và Ngưỡng cao (T_high) của Canny ngay tức thì.
4. **Nút lật Camera**: Có thể chuyển đổi qua lại giữa Camera trước và Camera sau.
5. **Tiếng Việt 100%**: Giao diện hoàn toàn bằng tiếng Việt để sinh viên dễ dàng làm quen.

---

## 💻 Cách trải nghiệm ngay trên máy tính của bạn

Hiện tại, tôi đã khởi động sẵn server cục bộ (Vite Dev Server). Bạn có thể mở trình duyệt và truy cập vào đường link sau để xem thành quả ngay lập tức:

👉 **[http://localhost:5173/](http://localhost:5173/)**

> [!NOTE]
> Khi mở link, trình duyệt sẽ yêu cầu quyền truy cập Camera. Hãy chọn **"Allow" (Cho phép)**. Quá trình tải thư viện lõi OpenCV.js (tầm 1-2 giây) sẽ hiển thị màn hình chờ (Loading) xoay tròn rất chuyên nghiệp.

---

## 🚀 Hướng dẫn Deploy lên Vercel cho buổi thuyết trình

Để các bạn sinh viên ngồi dưới có thể dùng điện thoại truy cập vào app của bạn, bạn cần đưa thư mục `web` này lên mạng thông qua Vercel.

**Cách làm cực kỳ đơn giản (Miễn phí hoàn toàn):**

1. Bạn tạo một tài khoản GitHub (nếu chưa có).
2. Tạo một repository mới trên GitHub và upload thư mục `D:\Workspace\Xử Lý Ảnh\Lab2_Part2\web` lên đó.
3. Đăng nhập vào **[Vercel.com](https://vercel.com/)** bằng tài khoản GitHub của bạn.
4. Chọn **Add New Project**, chọn Repository bạn vừa tạo trên GitHub.
5. Vercel sẽ tự động nhận diện đây là dự án Vite. Bạn chỉ việc nhấn nút **Deploy**.
6. Chỉ mất 10 giây, Vercel sẽ cấp cho bạn một đường link public (Ví dụ: `https://canny-edge-detector.vercel.app`).
7. **Bí kíp thuyết trình**: Bạn lên trang web tạo QR Code (như qrcode-monkey.com), tạo một mã QR từ đường link Vercel kia. Chèn mã QR khổng lồ này vào 1 slide PowerPoint ở cuối giờ.

**Khi bạn bảo khán giả: *"Hãy lấy điện thoại ra, quét mã QR trên màn hình và chĩa camera về phía mình để thấy phép màu của Canny"*, đảm bảo cả hội trường sẽ phải trầm trồ!**
