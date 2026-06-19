# 🌊 Wavelet Studio: So sánh & Tìm kiếm hình ảnh bằng Wavelet Hashing

![Trạng thái](https://img.shields.io/badge/Trạng_thái-Hoàn_thành-success)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Flask](https://img.shields.io/badge/Flask-2.0+-lightgrey)
![HTML/CSS/JS](https://img.shields.io/badge/Frontend-Vanilla-orange)

Dự án này là ứng dụng thực hành môn Xử lý ảnh (Lab 4), tập trung vào kỹ thuật phân tích, so sánh mức độ tương đồng và tìm kiếm hình ảnh sử dụng **Biến đổi Wavelet (DWT)** kết hợp **Khoảng cách Hamming**.

---

## 📱 Quét mã QR để trải nghiệm

<div align="center">
  <img src="QR.jpg" alt="Mã QR Truy cập Wavelet Studio" width="250" />
  <p><i>(Quét mã QR trên để mở ứng dụng Web)</i></p>
</div>

---

## ✨ Các tính năng chính

1. **So sánh hình ảnh (1:1)**
   - Tải lên 2 bức ảnh bất kỳ để kiểm tra mức độ giống nhau.
   - Hiển thị trực quan quá trình băm Wavelet (cA, cH, cV, cD).
   - In ra khoảng cách Hamming và Tỷ lệ tương đồng (%) chính xác.
   - So sánh sức mạnh của nhiều loại Wavelet khác nhau (Haar, Daubechies, Symlet, Coiflet...).

2. **Tìm kiếm hình ảnh (1:N)**
   - Tìm ra các bức ảnh giống với ảnh truy vấn nhất từ một kho dữ liệu (Database).
   - Hệ thống tự động quét và tính toán khoảng cách Hamming với toàn bộ ảnh trong thư mục `web/database/`.
   - Kết quả được sắp xếp trực quan theo độ tương đồng giảm dần.

3. **Giao diện hiện đại (Dark Mode)**
   - Giao diện người dùng (UI) thân thiện, chuyên nghiệp, hỗ trợ thao tác kéo-thả (Drag & Drop).

---

## 🛠 Công nghệ sử dụng (Tech Stack)

**Phân tích thuật toán & Backend:**
- **Python 3.10+**: Ngôn ngữ lập trình chính.
- **PyWavelets (pywt)**: Thư viện cốt lõi để thực hiện biến đổi Wavelet rời rạc (DWT).
- **NumPy**: Tính toán ma trận và mảng số học tốc độ cao.
- **Flask**: Micro-framework xây dựng API server backend.
- **Pillow (PIL)**: Đọc, chuyển đổi grayscale và thay đổi kích thước ảnh.

**Frontend:**
- **Vanilla HTML5, CSS3, JavaScript (ES6)**: Đảm bảo tốc độ tải trang nhanh nhất mà không cần phụ thuộc thư viện ngoài. CSS Grid & Flexbox cho bố cục Responsive.

---

## 📁 Cấu trúc dự án

```text
d:\Workspace\Xử Lý Ảnh\Lab3_Part1\
├── README.md              # Tài liệu dự án (bạn đang đọc)
├── QR.jpg                 # Mã QR truy cập dự án
├── notebooks/             # Môi trường Jupyter Notebook
│   └── lab4_wavelet_hashing.ipynb  # Phân tích thuật toán từng bước
├── web/                   # Ứng dụng Web chính
│   ├── api/
│   │   └── index.py       # Flask backend API (chứa logic băm và tìm kiếm)
│   ├── database/          # Thư mục chứa hàng chục ảnh dùng cho chức năng Tìm kiếm (1:N)
│   ├── index.html         # Giao diện chính của ứng dụng
│   ├── style.css          # Giao diện CSS Dark mode
│   ├── app.js             # Logic Frontend gọi API và render giao diện
│   ├── requirements.txt   # Các thư viện Python cần thiết
│   └── vercel.json        # Cấu hình deploy Vercel
```

---

## 🧠 Tóm tắt quy trình hoạt động (Pipeline)

1. **Tiền xử lý**: Ảnh đầu vào được chuyển sang màu xám (Grayscale) và thay đổi kích thước chuẩn (256x256 pixel).
2. **Biến đổi Wavelet (DWT)**: Phân tách đặc trưng tần số của ảnh, sử dụng thành phần xấp xỉ (Approximation - cA) để lấy dữ liệu quan trọng nhất.
3. **Tạo mã băm (Hashing)**: Lượng tử hóa ma trận hệ số cA: nếu giá trị ≥ giá trị trung bình sẽ mang bit `1`, ngược lại mang bit `0`, tạo thành một chuỗi nhị phân (Hash).
4. **So sánh Hamming**: Thuật toán đếm số bit khác biệt giữa các mã băm. Càng ít bit sai khác, tỷ lệ phần trăm tương đồng giữa hai ảnh càng cao.

---

## 🚀 Hướng dẫn cài đặt và chạy (Local)

**Bước 1: Cài đặt thư viện**
Di chuyển vào thư mục `web` và cài đặt các thư viện Python:
```bash
cd web
pip install -r requirements.txt
```

**Bước 2: Chạy Server Flask**
Khởi động ứng dụng backend:
```bash
python api/index.py
```

**Bước 3: Sử dụng**
Mở trình duyệt web và truy cập địa chỉ: [http://localhost:5000](http://localhost:5000). 
Ứng dụng có sẵn hàng chục ảnh ở mục `web/database` để bạn dễ dàng test chức năng Tìm kiếm (1:N).

---
*Phát triển cho học phần Xử Lý Ảnh - Wavelet Image Similarity.*
