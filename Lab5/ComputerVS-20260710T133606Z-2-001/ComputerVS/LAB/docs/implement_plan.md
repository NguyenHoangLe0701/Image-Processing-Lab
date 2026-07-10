# Kế Hoạch Triển Khai: Hệ Thống Nhận Diện Khuôn Mặt Thời Gian Thực

## 1. Mục Đích Tài Liệu

Tài liệu này vạch ra các bước thực hiện cụ thể cho hệ thống **Nhận diện khuôn mặt thời gian thực** sử dụng MTCNN và FaceNet, đảm bảo hệ thống có khả năng phân biệt "Người quen" và "Người lạ" với độ bảo mật cao.

---

## 2. Cấu Trúc Thư Mục Dự Án

```
Lab5_Webcam/
├── src/
│   ├── detector.py       # Module MTCNN (phát hiện mặt)
│   ├── embedding.py      # Module FaceNet (trích xuất vector)
│   ├── recognizer.py     # Logic so sánh Cosine Similarity
│   ├── database.py       # Load/Save .npy files
│   └── camera.py         # Xử lý luồng OpenCV
├── dataset/
│   ├── raw/              # Ảnh gốc
│   ├── aligned/          # Ảnh đã cắt mặt (160x160)
│   ├── unknown/          # Dữ liệu "Người lạ" để kiểm thử
│   └── embeddings/       # File npy (trí nhớ của hệ thống)
├── notebook/
│   └── Lab5_Webcam.ipynb # Notebook demo & đánh giá
└── models/
    └── facenet/          #file .h5
└── docs/
    └── report/           # Các biểu đồ Confusion Matrix, ROC
```

---

## 3. Các Giai Đoạn Triển Khai

### Giai Đoạn 1: Tiền xử lý & Trích xuất (Feature Extraction)

| Hạng mục | Chi tiết | Tình trạng |
|---|---|---|
| **MTCNN Pipeline** | Xây dựng hàm cắt mặt, căn lề và chuẩn hóa (160x160) | ✅ Xong |
| **FaceNet Embedding** | Chuyển đổi toàn bộ khuôn mặt trong `aligned` thành vector 512 chiều | ✅ Xong |
| **Cơ sở dữ liệu** | Lưu trữ vector vào `embeddings.npy` và nhãn vào `labels.npy` | ✅ Xong |

### Giai Đoạn 2: Hệ thống thời gian thực (Real-time Pipeline)

| Hạng mục | Chi tiết | Tình trạng |
|---|---|---|
| **Logic Webcam** | Tích hợp `cv2.VideoCapture` với MTCNN (phát hiện theo frame) | ✅ Xong |
| **So sánh Cosine** | Tính độ tương đồng giữa embedding hiện tại với DB | ✅ Xong |
| **Ngưỡng (Threshold)** | Áp dụng threshold 0.7 để lọc "Matched" vs "Unknown" | ✅ Xong |

### Giai Đoạn 3: Đánh giá mô hình (Model Evaluation)

| Hạng mục | Chi tiết | Tình trạng |
|---|---|---|
| **Dữ liệu Unknown** | Thu thập và tiền xử lý tập ảnh "Người lạ" (`unknown/`) | ✅ Xong |
| **Confusion Matrix** | Vẽ ma trận phân loại Nhị phân (Tương tự/Không tương tự) | ✅ Xong |
| **Accuracy Metrics** | Tính Sensitivity, Specificity, Accuracy | ✅ Xong |
| **Threshold Curve** | Vẽ đồ thị chọn ngưỡng tối ưu | ✅ Xong |

---

## 4. Các Thách Thức Kỹ Thuật & Giải Pháp

| # | Thách thức | Giải pháp |
|---|---|---|
| 1 | **Hiệu năng thời gian thực** | Sử dụng MTCNN chỉ trên 1 frame thay vì every frame nếu máy quá lag; Resize webcam về 640x480. |
| 2 | **Độ bảo mật (False Positive)** | Tinh chỉnh Threshold (0.7) dựa trên đường cong Accuracy. |
| 3 | **Ảnh Unknown bị lỗi** | Xây dựng pipeline xử lý tự động `preprocess_dataset` cho mọi dữ liệu mới. |
| 4 | **Sự ổn định** | Dùng cấu trúc modular (`src/`) để dễ dàng nâng cấp model sau này. |

---

## 5. Hướng Dẫn Chạy Hệ Thống

### 5.1. Khởi chạy nhận diện

```bash
# Đảm bảo đã có đầy đủ thư viện
pip install mtcnn keras-facenet opencv-python scikit-learn

# Chạy Notebook để demo
jupyter notebook notebook/Lab5_Webcam.ipynb
```

### 5.2. Đánh giá hệ thống

1. Chạy script tiền xử lý cho tập `unknown` (đã triển khai).
2. Chạy Cell vẽ Confusion Matrix để xuất biểu đồ minh chứng khả năng chống đột nhập (Specificity).
3. Xuất kết quả các chỉ số metrics vào báo cáo.

---

## 6. Timeline Hoàn Tất

- ✅ **Hoàn thành:** Cấu trúc dữ liệu, Tiền xử lý, Pipeline nhận diện thời gian thực.
- ✅ **Hoàn thành:** Đánh giá mô hình qua ma trận nhầm lẫn & Threshold curve.
- 🔄 **Đang làm:** Chuẩn bị báo cáo cuối kỳ dựa trên các biểu đồ đã xuất.

---

> 📌 **LƯU Ý:** Hệ thống hiện tại đã đạt độ chính xác ~97% (Accuracy) và 100% (Specificity) trên tập dữ liệu kiểm thử. Các file trong `src/` hiện đã ổn định, không cần sửa đổi thêm trừ khi thay đổi kiến trúc model.