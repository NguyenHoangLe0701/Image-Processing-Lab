# Kế Hoạch Triển Khai (Implementation Plan) & AI Handoff

---

> 🤖 **AI HANDOFF PROMPT 1 (Dành cho Ứng dụng Web):**
> *"Tôi cần viết một ứng dụng web xử lý ảnh có tên NeuraMatch Studio bằng **Flask (Backend)** và **HTML/CSS/Vanilla JS (Frontend)**. 
> Mục tiêu: So sánh ảnh bằng **Siamese Network** sử dụng **CNN (ResNet18)**.
> Quy tắc Backend (`server/app.py`): Xây dựng API nhận JSON chứa 2 ảnh Base64. Load file `siamese_model.pth` được train bằng PyTorch. Model cần có class `CNNFeatureExtractor` (ResNet18 lược bỏ lớp FC cuối, thêm `Linear(512->256)`, `Linear(256->128)`) và `SiameseNetwork` (shared weights). Khi inference: tự resize ảnh về 224x224, chuẩn hóa theo ImageNet (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]). Tính **Khoảng cách Euclidean** giữa 2 vector đặc trưng (128-dim). Trả về JSON: `distance`, `is_similar` (dựa trên `threshold`), `similarity_pct`, và 2 mảng `feature1`, `feature2` để frontend trực quan hóa.
> Quy tắc Frontend (`web/app.js`): Xây dựng 2 dropzone cho phép kéo thả ảnh. Khi người dùng click 'So sánh', xuất ảnh từ FileReader ra Base64. Fetch tới API Flask (`POST /api/predict`). Nhận kết quả và cập nhật giao diện: hiển thị SVG ring gauge cho % tương tự, cập nhật verdict (Giống/Khác), và đặc biệt phải dùng `<canvas>` vẽ bar chart cho 2 mảng feature 128-dim trả về.*

> 🤖 **AI HANDOFF PROMPT 2 (Dành cho File Jupyter Notebook Lab 5):**
> *"Đóng vai là một chuyên gia Computer Vision/AI. Hãy viết code cho một Jupyter Notebook hoàn chỉnh giải bài toán **"Photo Matching sử dụng Siamese Network"**. Yêu cầu sử dụng PyTorch.
> **Bước 1-2: Import & Chuẩn bị:** Cài đặt thư viện (nếu cần), import `torch`, `torchvision`, `torch.nn`.
> **Bước 3: Chuẩn bị Dataset:** Viết class `SiameseDataset` kế thừa `torch.utils.data.Dataset`. Đọc từ `input/similar/` (label 1) và `input/dissimilar/` (label 0). Áp dụng `transforms` (Resize 224, ToTensor, Normalize ImageNet).
> **Bước 4: Xây dựng CNN:** Xây dựng `CNNFeatureExtractor` dùng `resnet18` pre-trained làm backbone. Output là vector 128 chiều.
> **Bước 5: Xây dựng Siamese Network:** Xây dựng `SiameseNetwork` chạy 2 ảnh qua CNN để trích xuất 2 feature vectors, tính Euclidean distance.
> **Bước 6: Hàm Loss & Optimizer:** Implement `ContrastiveLoss` (dùng cho Siamese) và optimizer (Adam).
> **Bước 7: Huấn luyện (Training):** Viết vòng lặp training (khoảng 10-20 epochs), có progress bar, in loss, và lưu model thành `siamese_model.pth`.
> **Bước 8: Đánh giá:** Vẽ biểu đồ Loss, tính Accuracy/Precision trên tập validation/test.
> **Bước 9: Chạy Demo:** Viết hàm `predict(imgA, imgB, model)` để minh họa kết quả với ảnh thực tế.*

---

## 1. Cấu Trúc Dự Án (Project Structure)

Dự án bao gồm phần mô hình AI (Jupyter Notebook) và ứng dụng Web demo:

```text
Lab5/
├── notebooks/
│   └── photo_matching.ipynb    # Code huấn luyện và đánh giá Siamese Network
├── input/                      # Dataset
│   ├── similar/                # Ảnh chứa cặp giống nhau
│   └── dissimilar/             # Ảnh chứa cặp khác nhau
├── web/                        # Giao diện tĩnh (Frontend)
│   ├── index.html              # HTML structure
│   ├── style.css               # Design system & Animations
│   ├── app.js                  # Frontend logic (gọi API, render canvas)
│   └── vercel.json             # Cấu hình deploy tĩnh lên Vercel
├── server/                     # Backend API xử lý suy luận (Inference)
│   ├── app.py                  # API Server (Flask + PyTorch)
│   ├── requirements.txt        # Thư viện: flask, torch, torchvision, pillow, flask-cors
│   ├── render.yaml             # Cấu hình Web Service trên Render
│   └── models/
│       └── siamese_model.pth   # Trọng số mô hình sau khi train
└── docs/                       # Tài liệu (Problem Definition, Implement Plan, Technical Notes)
```

---

## 2. Chi Tiết Thuật Toán (Core Logic)

### 2.1. Dataset & Tiền xử lý (`notebooks/photo_matching.ipynb`)
- Class `SiameseDataset` nạp ngẫu nhiên cặp ảnh giống nhau (`pair_XXX_a`, `pair_XXX_b`) hoặc khác nhau từ thư mục `input`.
- Tiền xử lý theo chuẩn ImageNet:
  - Resize về `224x224`.
  - Chuyển thành `Tensor`.
  - Normalize: `mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`.

### 2.2. Trích xuất đặc trưng (Feature Extraction)
- Sử dụng ResNet18 (bỏ lớp phân loại cuối cùng).
- Thêm 2 lớp Fully Connected: `Linear(512, 256) -> ReLU -> Linear(256, 128)`.
- Mục đích: Ép mô hình biểu diễn hình ảnh dưới dạng một **vector nhúng (embedding vector) 128 chiều** dày đặc.

### 2.3. Siamese Network & Khoảng cách Euclidean
- `feat_a = CNN(img_a)`
- `feat_b = CNN(img_b)`
- Khoảng cách (Distance): `D = ||feat_a - feat_b||₂` (L2 Norm / Euclidean Distance).

### 2.4. Hàm Mất Mát Contrastive Loss
- Nếu nhãn `Y=0` (Giống nhau): Loss = `½ * D²` (Kéo D về 0).
- Nếu nhãn `Y=1` (Khác nhau): Loss = `½ * max(0, margin - D)²` (Đẩy D ra xa, lớn hơn `margin`, thường `margin=1.0` hoặc `2.0`).

---

## 3. Các API Endpoints (`server/app.py`)

| Route | Payload (JSON) | Chức năng |
|---|---|---|
| `POST /api/predict` | `image1` (Base64), `image2` (Base64), `threshold` | Thực hiện inference qua Siamese Network. Trả về `distance`, % tương đồng (`similarity_pct`), `is_similar`, và 2 mảng 128 số thực `feature1`, `feature2`. |
| `GET /api/health` | Không | Kiểm tra trạng thái server, loại thiết bị (CPU/GPU), trạng thái load model. |

---

## 4. Frontend Implementation (`web/app.js`)

1. **Giao diện kéo thả (Dropzone):** Hỗ trợ click để chọn hoặc kéo thả file. File được đọc bằng `FileReader` ra định dạng `DataURL` (Base64).
2. **Gọi API:** Dùng `fetch()` gửi POST request chứa ảnh base64 đến backend. Có hiển thị trạng thái loading "Đang xử lý qua Siamese Network...".
3. **Hiển thị kết quả (DOM Rendering):**
   - Vòng cung SVG (Circle Progress) thể hiện `% tương đồng` với animation.
   - Thẻ (Badge) Verdict: xanh ngọc (`Giống nhau`) hoặc đỏ hồng (`Khác nhau`).
   - Khối lượng thông số (Distance, Threshold, Embedding Dim).
4. **Trực quan hóa Đặc trưng (Feature Visualization):** Dùng thẻ `<canvas>` để vẽ mảng 128-dim trả về từ API dưới dạng biểu đồ cột (Bar chart). Màu cột sẽ thay đổi tùy thuộc vào verdict (Giống/Khác).

---

## 5. Triển Khai (Deployment)

### 5.1. Triển Khai Frontend (Vercel)
Vì hệ thống không cần backend cho UI (UI gọi API từ domain khác), có thể deploy tĩnh lên Vercel.
- **Root Directory:** `web/`
- **Cấu hình `vercel.json`:**
```json
{
  "cleanUrls": true
}
```

### 5.2. Triển Khai Backend (Render)
Sử dụng Render Web Service thay vì Vercel Serverless do giới hạn dung lượng 250MB của AWS Lambda (PyTorch rất nặng).
- **Root Directory:** `server/`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
- **Cấu hình `render.yaml`:**
```yaml
services:
  - type: web
    name: neuramatch-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
    plan: free
```
- Frontend phải trỏ biến hằng số `API_BASE` trong `app.js` về domain của Render.
