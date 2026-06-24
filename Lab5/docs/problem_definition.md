# Problem Definition: Ứng Dụng So Khớp Ảnh (NeuraMatch Studio)

---

## 1. Tổng Quan Dự Án

**Tên dự án:** NeuraMatch Studio - Photo Matching với Siamese Network  
**Ngôn ngữ lập trình:** Python (Backend + Notebook) + JavaScript (Frontend)  
**Framework:** Flask (Backend) + HTML/CSS/JS thuần (Frontend)  
**Mục tiêu:** Xây dựng một hệ thống có khả năng xác định mức độ tương đồng giữa hai hình ảnh bất kỳ bằng cách sử dụng kiến trúc **Mạng Nơ-ron Siamese (Siamese Network)** kết hợp **Mạng Nơ-ron Tích Chập (CNN - ResNet18)** để trích xuất đặc trưng, và đánh giá bằng **Khoảng cách Euclidean** trong không gian embedding 128 chiều.

---

## 2. Phát Biểu Bài Toán

Các phương pháp so sánh ảnh truyền thống (pixel-by-pixel, histogram, perceptual hashing) thường chỉ nắm bắt được các đặc trưng bề mặt (low-level features) như cường độ sáng, phân bổ màu, hay đường viền cạnh. Chúng gặp khó khăn khi ảnh có sự biến đổi phức tạp về góc chụp, ánh sáng, nền, hay khi cần đánh giá sự tương đồng về **ngữ nghĩa** (semantic similarity) — ví dụ: hai bức ảnh khác nhau nhưng cùng chụp một người, một vật thể, hay một cảnh.

Bài toán đặt ra là xây dựng **một hệ thống so khớp ảnh sử dụng Deep Learning**, cụ thể là kiến trúc Siamese Network, có khả năng:
- Học được các đặc trưng cấp cao (high-level features) từ dữ liệu huấn luyện.
- So sánh hai bức ảnh dựa trên vector đặc trưng trong không gian embedding, thay vì so sánh trực tiếp pixel.
- Cho phép tinh chỉnh (fine-tuning) mô hình trên bộ dữ liệu riêng của người dùng.

---

## 3. Đầu Vào (Input)

| Thành phần           | Mô tả                                                    |
| -------------------- | -------------------------------------------------------- |
| **File ảnh**         | Người dùng kéo thả hoặc tải lên 2 bức ảnh qua giao diện web |
| **Định dạng hỗ trợ** | `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff` (Ảnh sẽ được tự động resize về 224×224 và chuẩn hóa theo ImageNet) |
| **Tham số xử lý**    | Người dùng có thể điều chỉnh ngưỡng (threshold) để thay đổi độ nhạy phân loại |
| **Dữ liệu huấn luyện** | Thư mục `input/similar/` (cặp ảnh giống nhau) và `input/dissimilar/` (cặp ảnh khác nhau) |

---

## 4. Các Chức Năng Xử Lý (Processing Features)

### 4.1. Trích Xuất Đặc Trưng (Feature Extraction)

- Sử dụng **ResNet18 pre-trained** trên tập ImageNet (hơn 1 triệu ảnh, 1000 lớp) làm backbone CNN.
- Bỏ lớp Fully Connected (FC) cuối cùng của ResNet18.
- Thêm 2 lớp FC mới: `Linear(512 → 256) → ReLU → Linear(256 → 128)`.
- Output: **Vector đặc trưng 128 chiều** (embedding vector) cho mỗi ảnh đầu vào.

### 4.2. Siamese Network (Photo Matching)

- Hai ảnh đầu vào được truyền qua **cùng một mạng CNN** (shared weights / weight sharing).
- Kiến trúc Siamese đảm bảo hai ảnh được xử lý bởi cùng một bộ lọc, cho phép so sánh công bằng.
- Tính **Khoảng cách Euclidean** `||f(A) - f(B)||₂` giữa 2 embedding vectors.
- So sánh khoảng cách với ngưỡng (threshold) để đưa ra kết luận: Giống nhau hay Khác nhau.

### 4.3. Huấn Luyện Với Contrastive Loss

- Hàm mất mát **Contrastive Loss** giúp mô hình học cách:
  - **Kéo lại gần** (minimize distance) các cặp ảnh giống nhau.
  - **Đẩy ra xa** (maximize distance ≥ margin) các cặp ảnh khác nhau.
- Công thức: `L = (1 − Y) × ½ × D² + Y × ½ × max(0, margin − D)²`
- Optimizer: Adam với learning rate 0.0005.

---

## 5. Đầu Ra (Output)

| Thành phần               | Mô tả                                                     |
| ------------------------ | --------------------------------------------------------- |
| **Khoảng cách Euclidean** | Giá trị số thực biểu thị mức độ khác biệt giữa 2 ảnh trong không gian embedding |
| **Phần trăm tương đồng** | Quy đổi khoảng cách thành tỷ lệ % để dễ hiểu |
| **Verdict (Phán định)**   | "Giống nhau" hoặc "Khác nhau" dựa trên ngưỡng threshold |
| **Feature Vectors**       | Biểu đồ trực quan hóa 2 vector đặc trưng 128 chiều (bar chart) |
| **Loss Chart**            | Biểu đồ loss qua các epoch (trong notebook) |
| **Accuracy**              | Độ chính xác trên tập test (trong notebook) |

---

## 6. Kiến Trúc Hệ Thống

```
[Trình duyệt (HTML/CSS/JS)]
        │
        │  Gửi chuỗi JSON chứa 2 ảnh dạng Base64 (fetch API)
        ▼
[Flask Server (Render / Local)]
        │
        ├── /api/predict    → Nhận 2 ảnh, trả về distance + verdict
        └── /api/health     → Kiểm tra trạng thái server
        │
        ▼
[PyTorch + Siamese Network] (Inference in-memory)
        │
        ├── CNN (ResNet18 backbone)
        ├── Embedding Layer (512 → 256 → 128)
        └── Euclidean Distance Computation
```

---

## 7. Công Nghệ Sử Dụng

| Thành phần       | Công nghệ                                    |
| ---------------- | -------------------------------------------- |
| **Model**        | PyTorch, ResNet18 (ImageNet pre-trained)     |
| **Kiến trúc**    | Siamese Network, Contrastive Loss            |
| **Backend**      | Python 3.10+, Flask, Flask-CORS, Gunicorn    |
| **Frontend**     | HTML5, CSS3, ES6 JavaScript (Vanilla)        |
| **Giao tiếp**    | HTTP REST API (JSON chứa ảnh Base64)         |
| **Lưu trữ**     | Model `.pth` trên server. Không lưu ảnh upload. |
| **Triển khai**   | Vercel (Frontend static) + Render (Backend)  |

---

## 8. Cấu Trúc Thư Mục

```
Lab5/
├── notebooks/
│   └── photo_matching.ipynb    # Notebook 9 bước (train + đánh giá model)
├── input/
│   ├── similar/                # Dataset: cặp ảnh giống nhau (pair_XXX_a/b.jpg)
│   └── dissimilar/             # Dataset: cặp ảnh khác nhau (pair_XXX_a/b.jpg)
├── web/
│   ├── index.html              # Giao diện chính NeuraMatch Studio
│   ├── style.css               # Vanilla CSS (dark theme, glassmorphism)
│   ├── app.js                  # Frontend logic (dropzone, API call, visualization)
│   └── vercel.json             # Deploy Vercel
├── server/
│   ├── app.py                  # Flask API + Siamese Network inference
│   ├── requirements.txt        # Dependencies Python
│   ├── render.yaml             # Deploy Render
│   └── models/
│       └── siamese_model.pth   # Model đã train (copy từ notebook)
├── docs/
│   ├── problem_definition.md   # Phát biểu bài toán (file này)
│   ├── implement_plan.md       # Kế hoạch triển khai chi tiết
│   └── technical_notes.md      # Ghi chú kỹ thuật
├── rules.md                    # System rules cho AI
├── requirements.txt            # Dependencies cho notebook
└── README.md                   # Hướng dẫn tổng quát
```

---

## 9. Yêu Cầu Phi Chức Năng

- **Hỗ trợ GPU/CPU:** Tự động nhận diện thiết bị và sử dụng GPU nếu có, fallback sang CPU.
- **Trực quan & Dễ dùng:** Giao diện web cho phép kéo thả ảnh, hiển thị kết quả với biểu đồ vòng tròn (ring gauge) và trực quan hóa feature vectors.
- **Xử lý In-memory:** Không lưu ảnh upload lên server, toàn bộ xử lý trong RAM. Phù hợp với stateless deployment.
- **Tốc độ Inference:** So sánh 2 ảnh hoàn thành trong < 3 giây (trên CPU), < 1 giây (trên GPU).
- **CORS:** Backend hỗ trợ Cross-Origin để frontend từ domain khác (Vercel) có thể gọi API.

---

## 10. Phạm Vi Ngoài Dự Án (Out of Scope)

- Xác thực người dùng / đăng nhập / phân quyền.
- Tìm kiếm ảnh trong cơ sở dữ liệu lớn (Image Retrieval 1:N) — chỉ hỗ trợ so sánh 1:1.
- Huấn luyện model trực tiếp trên giao diện web (chỉ inference).
- Các bài toán CV khác: nhận diện khuôn mặt, phân vùng ảnh, object detection.
- Lưu trữ đám mây, lịch sử tìm kiếm, hoặc CSDL thực thụ.

---

## 11. Tiêu Chí Hoàn Thành (Definition of Done)

- [ ] Notebook chạy thành công 9 bước theo đề bài: Import → Dataset → CNN → Siamese → Loss → Training → Evaluation → Demo.
- [ ] Model được train và xuất file `.pth` thành công.
- [ ] Web app cho phép kéo thả 2 ảnh và so sánh.
- [ ] Kết quả hiển thị: khoảng cách Euclidean, % tương đồng, verdict (Giống/Khác), feature vector visualization.
- [ ] Backend Flask chạy local không lỗi.
- [ ] Frontend deploy thành công trên Vercel.
- [ ] Backend deploy thành công trên Render.
