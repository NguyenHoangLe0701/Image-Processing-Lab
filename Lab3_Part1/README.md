# 🌊 Image Processing Lab: Wavelet Image Hashing

Dự án này là bài tập thực hành môn Xử lý ảnh (Lab 4), tập trung vào kỹ thuật so sánh mức độ tương đồng giữa các hình ảnh sử dụng biến đổi Wavelet và khoảng cách Hamming.

Dự án bao gồm hai phần chính:
1. **Jupyter Notebook**: Phân tích và thử nghiệm thuật toán từng bước.
2. **Web Application**: Giao diện trực quan cho phép người dùng tải ảnh lên và so sánh trực tiếp, được xây dựng bằng Flask và có thể deploy lên Vercel.

---

## 📁 Cấu trúc dự án

```text
d:\Workspace\Xử Lý Ảnh\Lab3_Part1\
├── data/
│   └── input/
│       ├── similar/       # Thư mục chứa các ảnh giống/tương tự nhau để test
│       └── dissimilar/    # Thư mục chứa các ảnh hoàn toàn khác biệt để test
├── docs/                  # Tài liệu giải thích code, kiến trúc, và pipeline
│   ├── code_explanation.md
│   ├── implement_plan.md
│   ├── pipeline_diagram.png
│   ├── problem_definition.md
│   └── vercel_deployment.md  # Hướng dẫn deploy lên Vercel
├── notebooks/             # Môi trường Jupyter Notebook
│   └── lab4_wavelet_hashing.ipynb  # Notebook thực hành chính
├── web/                   # Ứng dụng Web
│   ├── api/
│   │   └── index.py       # Flask backend API
│   ├── index.html         # Frontend HTML
│   ├── style.css          # Giao diện CSS Dark mode
│   ├── app.js             # Logic Frontend
│   ├── requirements.txt   # Các thư viện Python cần thiết
│   └── vercel.json        # Cấu hình deploy Vercel
└── rules.md               # Quy tắc hoạt động của hệ thống
```

---

## 🚀 Cách chạy dự án trên máy tính cá nhân (Local)

### 1. Chạy Jupyter Notebook

Cài đặt các thư viện cần thiết:
```bash
pip install numpy opencv-python PyWavelets scikit-learn matplotlib jupyter
```

Mở notebook:
```bash
jupyter notebook notebooks/lab4_wavelet_hashing.ipynb
```
Notebook có thể tự tạo ảnh mẫu để chạy thử (synthetic data) nếu bạn chưa có sẵn ảnh trong thư mục `data`.

### 2. Chạy Web Application

Cài đặt thư viện cho web app (sử dụng Pillow thay vì OpenCV để nhẹ hơn khi deploy):
```bash
cd web
pip install -r requirements.txt
```

Khởi động Flask server:
```bash
python api/index.py
```

Truy cập địa chỉ `http://localhost:5000` trên trình duyệt để sử dụng ứng dụng.

---

## 🌐 Trải nghiệm trực tuyến

Phần Web App được thiết kế đặc biệt để có thể hoạt động hoàn hảo trên nền tảng **Vercel** dưới dạng Serverless Functions. Giao diện được thiết kế hiện đại, chuyên nghiệp, hỗ trợ Drag & Drop và hiển thị kết quả phân tích cực kỳ chi tiết bao gồm:
- Tỷ lệ tương đồng (Similarity Percentage).
- Khoảng cách Hamming.
- Hình ảnh trực quan của các thành phần tần số Wavelet (cA, cH, cV, cD).
- So sánh hiệu năng của nhiều loại Wavelet khác nhau (Haar, Daubechies, Symlet, Coiflet...).

> 👉 **[Xem hướng dẫn chi tiết cách deploy dự án này lên Vercel hoàn toàn miễn phí tại đây](docs/vercel_deployment.md)**.

---

## 🧠 Tóm tắt quy trình (Pipeline)

1. **Tiền xử lý**: Ảnh được chuyển sang màu xám (grayscale) và thay đổi kích thước chuẩn (256x256).
2. **Biến đổi Wavelet (DWT)**: Trích xuất các đặc trưng tần số của ảnh. Đặc biệt sử dụng thành phần xấp xỉ (Approximation - cA).
3. **Tạo Hash**: Giá trị của các thành phần được so sánh với giá trị trung bình để tạo thành chuỗi nhị phân (mã băm).
4. **So sánh Hamming**: Đếm số bit khác nhau giữa hai mã băm. Ít bit khác nhau đồng nghĩa với việc hai ảnh rất giống nhau.
5. **Đánh giá**: Sử dụng các chỉ số như Accuracy, Sensitivity, Specificity và đường cong ROC để tìm ra ngưỡng (threshold) phân loại tối ưu.
