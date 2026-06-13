# 🚀 Hướng Dẫn Deploy Web App lên Vercel

Dự án này chứa một Web App (nằm trong thư mục `web/`) được thiết kế đặc biệt để chạy dưới dạng Serverless Functions trên [Vercel](https://vercel.com) bằng Python (Flask).

Vì Vercel có giới hạn dung lượng cài đặt (khoảng 250MB sau khi giải nén), dự án này đã được tối ưu bằng cách:
- Sử dụng `Pillow` thay vì `opencv-python` (OpenCV rất nặng).
- File cấu hình `vercel.json` định tuyến mọi request API (`/api/*`) tới `api/index.py`, và phục vụ các file tĩnh (HTML/CSS/JS) qua CDN cực nhanh của Vercel.

Dưới đây là các bước siêu đơn giản để bạn đưa trang web này lên internet cho các bạn khác cùng trải nghiệm.

---

## Bước 1: Chuẩn bị tài khoản Vercel và GitHub

1. Truy cập [github.com](https://github.com/) và tạo tài khoản (nếu chưa có).
2. Đăng nhập vào [vercel.com](https://vercel.com/) bằng chính tài khoản GitHub vừa tạo.

## Bước 2: Đẩy (Push) code lên GitHub

Bạn cần đưa thư mục code này lên một repository trên GitHub.

1. Mở Terminal (Command Prompt / PowerShell / Git Bash).
2. Di chuyển đến thư mục gốc của dự án này (`d:\Workspace\Xử Lý Ảnh\Lab3_Part1`).
3. Chạy các lệnh sau:

```bash
# Khởi tạo git (nếu dự án chưa có)
git init

# Thêm tất cả file vào git
git add .

# Lưu lại trạng thái
git commit -m "Hoàn thành Lab 4 và Web App"
```

4. Lên trang chủ GitHub, nhấn nút **"New"** để tạo một Repository mới (ví dụ đặt tên là `wavelet-image-hashing`).
5. Copy các lệnh hướng dẫn đẩy code mà GitHub hiện ra và dán vào Terminal:

```bash
git branch -M main
git remote add origin https://github.com/<tên-tài-khoản-của-bạn>/wavelet-image-hashing.git
git push -u origin main
```

## Bước 3: Deploy trên Vercel

1. Vào Dashboard của Vercel ([vercel.com/dashboard](https://vercel.com/dashboard)).
2. Nhấn nút **"Add New..."** và chọn **"Project"**.
3. Trong danh sách "Import Git Repository", tìm đến repo `wavelet-image-hashing` mà bạn vừa push lên và nhấn **"Import"**.
4. 🛑 **CỰC KỲ QUAN TRỌNG: Thiết lập Root Directory**
   Vì ứng dụng web của chúng ta nằm gọn trong thư mục `web/`, bạn phải nói cho Vercel biết điều này:
   - Trong mục **"Root Directory"**, nhấn **"Edit"**.
   - Chọn thư mục `web`.
   - Nhấn **"Save"**.
5. Nhấn nút **"Deploy"** màu đen.

Vercel sẽ mất khoảng 1-2 phút để tải code của bạn, cài đặt các thư viện trong `requirements.txt` (như Flask, numpy, PyWavelets, Pillow) và khởi chạy trang web.

## Bước 4: Hoàn thành! 🎉

Khi màn hình hiện chữ **"Congratulations!"**, trang web của bạn đã online. 
Bạn có thể bấm vào hình ảnh trang web để truy cập, copy đường link (ví dụ: `https://wavelet-image-hashing.vercel.app/`) và gửi cho giáo viên hoặc bạn bè để họ vào test ảnh.
