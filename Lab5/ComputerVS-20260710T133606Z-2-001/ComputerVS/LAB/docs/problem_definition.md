# Problem Definition: Hệ Thống Nhận Diện Khuôn Mặt Thời Gian Thực

## 1. Tổng Quan Dự Án

- **Tên dự án:** Real-time Face Recognition System
- **Ngôn ngữ lập trình:** Python
- **Công nghệ chính:** OpenCV, MTCNN, FaceNet (Keras), Scikit-learn
- **Mục tiêu:** Xây dựng hệ thống nhận diện khuôn mặt thời gian thực từ Webcam, có khả năng phân biệt giữa đối tượng đã được đăng ký (Matched) và đối tượng lạ (Unknown) với độ bảo mật và độ chính xác cao.

---

## 2. Phát Biểu Bài Toán

Trong các hệ thống an ninh hiện đại, việc xác thực danh tính nhanh chóng là yếu tố then chốt. Bài toán đặt ra là phát triển một hệ thống có khả năng:

1. **Phát hiện khuôn mặt:** Tự động tìm kiếm khuôn mặt trong luồng video.
2. **Trích xuất đặc trưng:** Chuyển đổi khuôn mặt thành "chữ ký số" (vector embedding).
3. **Phân loại thời gian thực:** So sánh chữ ký này với cơ sở dữ liệu đã học để xác định danh tính, đồng thời từ chối các khuôn mặt lạ (Unknown).

---

## 3. Đầu Vào (Input)

| Thành phần | Mô tả |
|---|---|
| **Luồng Video** | Tín hiệu từ Webcam (Real-time) hoặc tệp video mẫu |
| **Cơ sở dữ liệu (Database)** | Tập ảnh gốc của các nhân vật đã được huấn luyện |
| **Tham số hệ thống** | `Threshold` (ngưỡng so sánh), `Confidence` (độ tin cậy của MTCNN) |

---

## 4. Các Chức Năng Chính (Core Features)

### 4.1. Tiền Xử Lý (Preprocessing)

- Sử dụng MTCNN để phát hiện khuôn mặt.
- Tự động căn lề (alignment) và cắt khuôn mặt về kích thước chuẩn **160x160 px**.
- Chuẩn hóa giá trị pixel trước khi đưa vào FaceNet.

### 4.2. Nhận Diện & Trích Xuất (Detection & Recognition)

- **Feature Extraction:** Sử dụng FaceNet để tạo vector đặc trưng 512 chiều.
- **Comparison Engine:** Tính khoảng cách Cosine giữa vector của người lạ và database người quen.

### 4.3. Phân Loại & Hiển Thị (Decision & Visualization)

- **Threshold-based Classification:**
  - Nếu `Similarity > 0.7`: Hiển thị tên nhân vật (**Matched** - Màu xanh).
  - Nếu `Similarity <= 0.7`: Hiển thị (**Unknown** - Màu đỏ).
- **Visualization:** Vẽ khung chữ nhật (bounding box) và tên/trạng thái trực tiếp lên luồng video.

---

## 5. Đầu Ra (Output)

| Thành phần | Mô tả |
|---|---|
| **Kết quả trực tiếp** | Luồng video hiển thị trên cửa sổ với nhãn (Matched/Unknown) |
| **Đánh giá hiệu năng** | Ma trận nhầm lẫn (Confusion Matrix) và Đường cong Accuracy (Threshold Curve) |
| **Database trạng thái** | File `.npy` chứa vector embedding và nhãn tên nhân vật |

---

## 6. Kiến Trúc Hệ Thống

```
[Webcam Stream]
       |
       ↓
[MTCNN Detector] ──→ Phát hiện & Cắt khuôn mặt
       |
       ↓
[FaceNet Model]  ──→ Trích xuất vector đặc trưng (Embedding)
       |
       ↓
[Cosine Similarity] ──→ So sánh với [Database người quen]
       |
       ↓
[Decision Logic] ──→ Phân loại "Matched" hoặc "Unknown"
       |
       ↓
[Display Output] ──→ Hiển thị khung hình (OpenCV)
```

---

## 7. Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| **Framework ML** | TensorFlow/Keras, FaceNet-Keras |
| **Xử lý ảnh** | OpenCV (`cv2`), MTCNN |
| **Tính toán** | NumPy, Scikit-learn, SciPy |
| **Đánh giá** | Matplotlib, Seaborn |

---

## 8. Yêu Cầu Phi Chức Năng

- **Thời gian thực:** Độ trễ (latency) thấp, đạt tốc độ khung hình ổn định (>15 FPS).
- **Tính bảo mật:** Tỷ lệ bỏ sót người lạ (False Positive) phải bằng 0 hoặc cực thấp.
- **Khả năng mở rộng:** Dễ dàng thêm người mới vào hệ thống mà không cần train lại mô hình (chỉ cần thêm embedding vào file `.npy`).

---

## 9. Tiêu Chí Hoàn Thành (Definition of Done)

- [ ] Pipeline tiền xử lý ảnh (MTCNN) hoạt động ổn định trên cả ảnh train và ảnh lạ.
- [ ] Trích xuất Embedding và lưu trữ thành công vào file `.npy`.
- [ ] Hệ thống nhận diện thời gian thực qua Webcam hiển thị đúng trạng thái.
- [ ] Confusion Matrix được vẽ thành công với đầy đủ 2 nhãn: "Tương tự" và "Không tương tự".
- [ ] Báo cáo kết quả với Accuracy và Specificity > 95%.