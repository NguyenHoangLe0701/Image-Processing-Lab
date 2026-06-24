# Hướng Dẫn Triển Khai (Deployment Guide)

Tài liệu này hướng dẫn chi tiết từng bước để đưa ứng dụng **NeuraMatch Studio** (Photo Matching) lên Internet hoàn toàn miễn phí, để bạn bè và người khác có thể trải nghiệm.

Kiến trúc triển khai:
- **Frontend (Giao diện web):** Triển khai trên **Vercel** (Nhanh, miễn phí, hỗ trợ file tĩnh cực tốt).
- **Backend (API xử lý AI):** Triển khai trên **Render** (Hỗ trợ môi trường Python/Docker để chạy PyTorch, miễn phí).

---

## Phần 1: Chuẩn Bị Trước Khi Deploy

1. Đảm bảo bạn đã train mô hình trong Jupyter Notebook và có file `siamese_model.pth`.
2. Copy file `siamese_model.pth` vào thư mục `Lab5/server/models/`.
3. Đưa toàn bộ code của bạn lên một kho lưu trữ **GitHub**.

---

## Phần 2: Deploy Backend lên Render

Vì mô hình PyTorch khá nặng, Render là lựa chọn tốt nhất ở phân khúc miễn phí (Free Tier) để chạy Web Service.

### Bước 1: Tạo Web Service mới
1. Đăng nhập vào [Render.com](https://render.com/).
2. Nhấn nút **New** > **Web Service**.
3. Chọn kho lưu trữ (Repository) GitHub chứa code của bạn.

### Bước 2: Cấu hình Web Service
Điền các thông tin sau:
- **Name:** `neuramatch-api` (hoặc tên tùy ý)
- **Region:** Chọn vùng gần bạn nhất (VD: Singapore hoặc US).
- **Branch:** `main` (hoặc nhánh bạn đang code).
- **Root Directory:** Nhập `Lab5/server` (Rất quan trọng, để báo Render biết thư mục gốc của backend).
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`

### Bước 3: Cấu hình Biến môi trường (Environment Variables)
- Cuộn xuống phần **Environment Variables**, thêm biến sau:
  - Key: `PYTHON_VERSION`
  - Value: `3.11.0` (Hoặc phiên bản Python bạn dùng).

### Bước 4: Deploy
- Nhấn **Create Web Service**. 
- Chờ khoảng 3-5 phút để Render cài đặt PyTorch và khởi động server.
- Sau khi thành công, bạn sẽ nhận được một đường link API (VD: `https://neuramatch-api.onrender.com`). Hãy copy đường link này!

---

## Phần 3: Deploy Frontend lên Vercel

Frontend là giao diện web tĩnh, deploy trên Vercel cực kỳ mượt mà.

### Bước 1: Cập nhật cấu hình Frontend
1. Mở file `Lab5/web/app.js` trong code của bạn.
2. Tìm dòng số 8: 
   `const API_BASE = 'http://localhost:5000';`
3. Thay thế bằng URL API của Render bạn vừa copy ở trên. Ví dụ:
   `const API_BASE = 'https://neuramatch-api.onrender.com';`
4. Lưu file và Push code lên GitHub.

### Bước 2: Deploy trên Vercel
1. Đăng nhập vào [Vercel.com](https://vercel.com/).
2. Nhấn **Add New...** > **Project**.
3. Import kho lưu trữ GitHub của bạn.

### Bước 3: Cấu hình Vercel
- **Project Name:** `neuramatch-studio`
- **Framework Preset:** Chọn `Other`.
- **Root Directory:** Nhấn nút Edit và chọn thư mục `Lab5/web`.
- Nhấn **Deploy**.

Quá trình deploy Vercel chỉ mất vài giây. Sau khi xong, bạn sẽ nhận được một đường link truy cập giao diện chính thức.

---

## Phần 4: Lưu Ý Quan Trọng (Vấn đề Cold Start)

Do Backend deploy trên gói Miễn phí (Free Tier) của Render, nó sẽ có cơ chế **ngủ đông (Spin Down)** nếu không có ai truy cập trong vòng 15 phút.

- Khi có người truy cập lại sau 15 phút, Request đầu tiên sẽ đóng vai trò "đánh thức" server.
- Việc đánh thức này (Cold Start) mất khoảng **30 giây đến 1 phút** do phải load lại thư viện PyTorch khổng lồ vào RAM.
- **Lời khuyên:** Khi gửi link cho bạn bè trải nghiệm, hãy dặn họ: *"Nếu bấm So sánh lần đầu mà thấy xoay hơi lâu (tầm 1 phút), hãy kiên nhẫn đợi server thức dậy nhé. Những lần so sánh tiếp theo sẽ cực kỳ nhanh!"*.

---

## Phần 5: Tạo Mã QR (Tùy chọn)

Để bạn bè trải nghiệm tiện lợi hơn trên điện thoại di động:
1. Copy đường link giao diện Vercel của bạn.
2. Truy cập các trang tạo mã QR miễn phí (VD: `qr-code-generator.com`).
3. Dán link vào và tải file ảnh QR (đặt tên là `QR.jpg`).
4. Bỏ file `QR.jpg` vào thư mục gốc dự án và hướng dẫn mọi người quét!
