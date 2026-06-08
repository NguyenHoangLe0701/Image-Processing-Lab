# 🔍 Bài Thực Hành Chương 2 (Phần 2): CANNY EDGE DETECTOR

> Bài thực hành về thuật toán phát hiện cạnh Canny — một trong những thuật toán quan trọng nhất trong Xử lý ảnh và Thị giác máy tính.

## 📁 Cấu trúc thư mục

```
Lab2_Part2/
│
├── 📄 README.md                     ← Bạn đang ở đây
├── 📄 requirements.txt              ← Danh sách thư viện cần cài
│
├── 📓 Phan1_LyThuyet_Canny.ipynb    ← Phần I: Lý thuyết + Phần III: Câu hỏi mở rộng
├── 📓 Phan2_ThucHanh_Canny.ipynb    ← Phần II: Code thực hành
│
└── 📁 data/
    └── 📁 input/                    ← Chứa các ảnh thực tế bạn tải về
        ├── caubason.jpg             ← Ảnh kiến trúc rõ nét
        ├── anhsuongmudatlat.jpg     ← Ảnh sương mù, tương phản thấp
        ├── caotoclongthanhdaugiay.jpg ← Ảnh vạch kẻ đường, nhiều chi tiết
        ├── hoconrua.jpg             ← Ảnh có khối hình học tròn (vòng xoay)
        └── khuphocohoian.jpg        ← Ảnh màu sắc rực rỡ
```

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Cài đặt thư viện

Bạn cần cài đặt các thư viện cơ bản phục vụ xử lý ảnh:

```bash
pip install -r requirements.txt
```

**Thư viện sử dụng:**
- `opencv-python`: Xử lý ảnh, `cv2.Canny()`
- `scikit-image`: `skimage.feature.canny()`, cung cấp ảnh mẫu mặc định
- `matplotlib`: Hiển thị ảnh, biểu đồ
- `numpy`: Xử lý mảng số
- `scipy`: Các hàm hỗ trợ như `ndimage.binary_fill_holes()`

### 2. Chuẩn bị ảnh thực hành

1. Tạo thư mục `data/` cùng cấp với file notebook.
2. Tải các ảnh bạn muốn thử nghiệm trên mạng về và lưu vào thư mục `data/`.
3. Mở file `Phan2_ThucHanh_Canny.ipynb`, tìm đến các cell đọc ảnh (ví dụ `cv2.imread('data/sample.jpg')`) và **đổi tên file** cho khớp với ảnh bạn đã tải.

*(Lưu ý: Nếu không có ảnh, code sẽ tự động dùng các ảnh mặc định có sẵn trong thư viện `scikit-image` để bạn vẫn có thể chạy và xem kết quả).*

### 3. Chạy notebook

Mở Jupyter Notebook hoặc VS Code, chạy lần lượt:

1. **`Phan1_LyThuyet_Canny.ipynb`** — Đọc lý thuyết trước
2. **`Phan2_ThucHanh_Canny.ipynb`** — Chạy code thực hành

```bash
jupyter notebook
```

## 📖 Nội dung bài thực hành

### Phần I — Lý thuyết (`Phan1_LyThuyet_Canny.ipynb`)

| Mục | Nội dung |
|:---|:---|
| **1.1** | 5 bước thuật toán Canny: Gaussian Smoothing → Gradient → NMS → Double Threshold → Edge Tracking |
| **1.1b** | Bảng so sánh Canny vs Sobel vs Laplacian |
| **1.2** | Ảnh hưởng tham số: Sigma (σ), ngưỡng thấp (T_low), ngưỡng cao (T_high) |
| **1.3** | Ưu/nhược điểm, ứng dụng thực tế (xe tự lái, y tế, công nghiệp) |

### Phần II — Thực hành (`Phan2_ThucHanh_Canny.ipynb`)

Phần thực hành code Python, bao gồm các hàm vẽ ảnh trực tiếp trong notebook, không phụ thuộc file ngoài.

| Bài tập | Nội dung | Kỹ thuật |
|:---|:---|:---|
| **2.1** | Canny bằng OpenCV và Scikit-image | `cv2.Canny()`, `skimage.feature.canny()` |
| **2.2a** | Khảo sát ảnh hưởng Sigma (6 giá trị) | Biểu đồ thống kê pixel cạnh |
| **2.2b** | Khảo sát ngưỡng thấp/cao (6 cặp) | So sánh tỷ lệ 2:1, 3:1, 5:1 |
| **2.2c** | So sánh Canny vs Sobel vs Laplacian | Hiển thị song song 3 phương pháp |
| **2.3a** | Canny trên ảnh nhiễu | `skimage.util.random_noise()` |
| **2.3b** | Canny trên ảnh tương phản thấp | CLAHE (`cv2.createCLAHE()`) |
| **2.3c** | Canny trên ảnh nhiều chi tiết | Ảnh coins, page |
| **2.4a** | Canny + Phân đoạn ảnh | `cv2.findContours()`, `ndimage.binary_fill_holes()` |
| **2.4b** | Canny + Nhận dạng hình dạng | `cv2.HoughCircles()`, `cv2.approxPolyDP()` |
| **2.4c** | Canny + Hough Line Transform | `cv2.HoughLinesP()` |
| **Bonus** | Canny trên ảnh màu (3 cách) | RGB channels, Lab color space |
| **Bonus** | Mô phỏng Canny trên video | Chuỗi frame mô phỏng |

### Phần III — Câu hỏi mở rộng (`Phan1_LyThuyet_Canny.ipynb`)

| Câu hỏi | Nội dung |
|:---|:---|
| **3.1** | Đánh giá chất lượng cạnh: Precision, Recall, F1, Pratt's FOM |
| **3.2** | Cải thiện Canny: Bilateral Filter, Auto-threshold, Deep Learning (HED) |
| **3.3** | Canny trên ảnh màu: 4 cách tiếp cận (Grayscale, RGB, Lab, Di Zenzo) |
| **3.4** | Canny trên video: Xử lý từng frame + temporal smoothing |

## 📊 Kết quả mong đợi

Sau khi chạy xong notebook, bạn sẽ:

- ✅ Hiểu được 5 bước của thuật toán Canny
- ✅ Biết cách sử dụng Canny với OpenCV và Scikit-image
- ✅ Hiểu ảnh hưởng của σ, T_low, T_high đến kết quả
- ✅ Biết cách chọn tham số phù hợp cho từng loại ảnh
- ✅ Biết kết hợp Canny với findContours, Hough Transform để phân đoạn và nhận dạng

---

> **Môn học:** Xử Lý Ảnh  
> **Chương:** 2 — Phát hiện cạnh (Edge Detection)  
> **Thuật toán:** Canny Edge Detector (John F. Canny, 1986)
