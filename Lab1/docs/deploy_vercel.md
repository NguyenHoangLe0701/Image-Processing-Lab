# Hướng dẫn Deploy dự án Image Basics Studio lên Vercel

Dự án Web App của Lab 1 được xây dựng bằng **Vite** + **HTML/JS thuần**. Để đưa dự án này lên mạng (deploy) hoàn toàn miễn phí, Vercel là sự lựa chọn tối ưu nhất.

Dưới đây là các bước chi tiết từ A-Z để deploy dự án lên Vercel.

---

## Bước 1: Chuẩn bị mã nguồn trên GitHub

Vercel sẽ lấy code trực tiếp từ GitHub của bạn để tự động build và deploy. 
- Hãy chắc chắn rằng toàn bộ thư mục `Lab1/web/` đã được commit và push lên repository `Image-Processing-Lab` trên tài khoản GitHub của bạn.
- Đảm bảo trong thư mục `Lab1/web/` có chứa file `package.json` và `vite.config.js`.

---

## Bước 2: Đăng nhập vào Vercel

1. Truy cập vào trang chủ: [https://vercel.com/](https://vercel.com/)
2. Nhấn vào nút **Sign Up** (nếu chưa có tài khoản) hoặc **Log In** ở góc phải màn hình.
3. Chọn **Continue with GitHub** để liên kết với tài khoản GitHub chứa repository của bạn.

---

## Bước 3: Import Dự Án (Repository)

1. Tại màn hình Dashboard của Vercel, nhấn vào nút **Add New...** ở góc trên cùng bên phải.
2. Chọn **Project**.
3. Trong mục *Import Git Repository*, tìm đến repository `Image-Processing-Lab` của bạn. 
4. Nhấn nút **Import** bên cạnh tên repository đó.

*(Nếu bạn không thấy repository hiện ra, hãy nhấn vào dòng "Adjust GitHub App Permissions →" để cấp quyền cho Vercel truy cập vào repo này).*

---

## Bước 4: Cấu hình thư mục gốc (Cực kỳ quan trọng)

Do ứng dụng Web của chúng ta không nằm ở ngoài cùng (root) của dự án mà nằm sâu trong thư mục `Lab1/web/`, bạn phải cấu hình lại đường dẫn này cho Vercel hiểu:

1. Trong màn hình **Configure Project**, hãy tìm mục **Root Directory**.
2. Nhấn vào nút **Edit**.
3. Tìm và chọn theo đường dẫn: `Lab1/` ➜ `web/`.
4. Nhấn **Save** hoặc **Continue**. Lúc này Vercel sẽ nhận diện đúng đây là một dự án Vite.

---

## Bước 5: Cấu hình Build Command và Deploy

Sau khi chọn đúng thư mục gốc, Vercel sẽ tự động cấu hình các thông số còn lại trong phần **Build and Output Settings**. Bạn chỉ cần kiểm tra lại cho chắc chắn:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

*(Bạn giữ nguyên các thiết lập mặc định này, không cần thay đổi gì thêm).*

Cuối cùng, nhấn vào nút **Deploy**.

---

## Bước 6: Hoàn tất và Cập nhật mã QR

1. Chờ khoảng 15-30 giây để Vercel tiến hành cài đặt thư viện và build dự án.
2. Khi hoàn tất, màn hình sẽ hiển thị thông báo "Congratulations!" cùng với giao diện Web App của bạn.
3. Nhấn vào nút **Continue to Dashboard** để xem thông tin chi tiết. Vercel sẽ cung cấp cho bạn một đường link public (ví dụ: `image-processing-lab.vercel.app`).
4. **Tạo QR Code:** Copy đường link này, lên các trang tạo mã QR miễn phí (như qr-code-generator.com) để tạo một mã QR.
5. Tải ảnh QR đó về, đổi tên thành `QR.jpg`, chép vào thư mục `Lab1/` của máy tính.
6. Commit và push lại lên GitHub. Mã QR này sẽ tự động hiển thị trong file `README.md` của Lab 1.

**Chúc bạn deploy thành công!**
