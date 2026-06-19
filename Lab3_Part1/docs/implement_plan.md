# Kế Hoạch Triển Khai (Implementation Plan) & AI Handoff

---

> 🤖 **AI HANDOFF PROMPT 1 (Dành cho Ứng dụng Web):**
> *"Tôi cần viết một ứng dụng web xử lý ảnh có tên Wavelet Studio bằng **Flask (Backend)** và **HTML/CSS/Vanilla JS (Frontend)**. 
> Mục tiêu: So sánh ảnh bằng **Wavelet Transform (DWT mức 4)** và **Khoảng cách Hamming**.
> Quy tắc Backend (`api/index.py`): Nhận JSON chứa ảnh Base64. Cấu hình DWT_LEVEL=4, IMG_SIZE=(256,256). Các mức Threshold: EXACT >= 0.85, SIMILAR >= 0.65. Thuật toán tạo mã băm: Xấp xỉ cA so sánh với `median(cA)`. Các mảng chi tiết cH, cV, cD lấy giá trị tuyệt đối rồi so sánh với `median(abs(cH))` tương ứng để đánh dấu cấu trúc đường nét. API trả về các ảnh sub-bands dưới dạng Base64. Các routes gồm: `/api/compare`, `/api/compare-wavelets`, `/api/search` (tìm ảnh trong thư mục `database/`), `/api/samples`.
> Quy tắc Frontend (`app.js`): Khi tải ảnh, phải dùng `<canvas>` resize ảnh về đúng 256x256 và xuất ra `image/jpeg` (quality 0.8) base64 TRƯỚC KHI gửi payload đi để chống nghẽn mạng. Dùng fetch gọi API và render kết quả DOM thuần (không React/Vue).*

> 🤖 **AI HANDOFF PROMPT 2 (Dành cho File Jupyter Notebook Lab 4):**
> *"Đóng vai là một chuyên gia Xử lý ảnh bằng Python. Hãy giúp tôi viết code hoàn chỉnh cho một Jupyter Notebook giải quyết bài tập **"So Sánh Sự Tương Đồng Của Các Hình Ảnh Sử Dụng Wavelet (Perceptual Hashing)"**. Yêu cầu sử dụng: `OpenCV/Pillow`, `PyWavelets`, `numpy`, `scikit-learn` và `matplotlib`.
> **Phần 1: Chuẩn bị dữ liệu:** Viết hàm đọc ảnh, chuyển sang Grayscale và resize về kích thước chuẩn (VD: 256x256). Tự động tải tập dữ liệu gồm cặp ảnh tương tự và không tương tự.
> **Phần 2: Trích xuất Wavelet & Tạo mã băm:** Dùng `pywt.wavedec2` (Level 4, 'haar') chuyển đổi ảnh thành ma trận wavelet. Binarize: cA so sánh với `median(cA)`; cH, cV, cD lấy trị tuyệt đối rồi so sánh với `median(abs)`. Duỗi thẳng và nối thành vector nhị phân 1D.
> **Phần 3: So sánh hàm băm:** Tính **Khoảng cách Hamming** giữa 2 mã băm suy ra % tương thích.
> **Phần 4: Đánh giá:** So sánh các cặp ảnh. Dùng `scikit-learn` tính **Độ chính xác (Accuracy)**, **Độ nhạy (Recall)**, **Độ đặc hiệu (Specificity)**. Vẽ **Đường cong ROC** và tính AUC.
> **Phần 5: Bài tập nâng cao:** 1. Chạy lặp qua nhiều hàm Wavelet (haar, db2, sym2...) để lập bảng so sánh hiệu suất. 2. Ứng dụng **Image Search 1:N**: Nhận 1 ảnh truy vấn và tìm top 3 ảnh giống nhất trong DB, hiển thị bằng lưới matplotlib."*

---

## 1. Cấu Trúc Dự Án (Project Structure)

Dự án bao gồm phần ứng dụng Web và phần thử nghiệm thuật toán (Jupyter Notebook):

```text
Lab3_Part1/
├── web/
│   ├── api/
│   │   └── index.py            # API Server (Flask), chứa thuật toán cốt lõi
│   ├── database/               # Thư mục chứa ảnh mẫu (jpg/png) cho tính năng Image Search
│   ├── app.js                  # Frontend Logic (Xử lý upload, canvas resize, fetch API)
│   ├── index.html              # UI chính
│   ├── style.css               # Vanilla CSS
│   ├── requirements.txt        # Các thư viện Python (Flask, Numpy, PyWavelets, Pillow)
│   └── vercel.json             # Cấu hình deploy serverless Vercel
│
├── notebooks/
│   └── lab4_wavelet_hashing.ipynb # File notebook bài Lab 4: Dùng để thử nghiệm, chạy nháp thuật toán Wavelet Hashing trước khi đưa vào web
└── data/                       # Dữ liệu ảnh đầu vào/đầu ra để chạy thử nghiệm nghiệm thu
```

---

## 2. Chi Tiết Thuật Toán (Core Logic)

### 2.1. Tiền Xử Lý Ảnh (Pillow + Numpy)
- Backend nhận Base64, dùng Pillow chuyển sang `Grayscale ('L')`.
- Resize ảnh về chuẩn `256x256` bằng thuật toán `LANCZOS` để giữ tối đa chi tiết.
- Chuyển thành ma trận `numpy.ndarray`.

### 2.2. Biến Đổi Wavelet
- Hàm `pywt.wavedec2(img, wavelet, level=4)`:
  - Phân rã ảnh qua 4 cấp. Ma trận cuối cùng có kích thước `16x16`.
  - Trả về `cA` (Xấp xỉ) và tuple `(cH, cV, cD)` (Chi tiết ngang, dọc, chéo).

### 2.3. Lượng Tử Hóa - Tạo Hash 1024-bit
Thuật toán nhị phân hóa khác biệt để tăng tính chính xác:
1. **Với mảng cA**: `hash_A = cA > np.median(cA)`.
2. **Với mảng cH, cV, cD**: Lấy độ lớn (Absolute) rồi so sánh với Median của độ lớn đó. Kỹ thuật này chỉ lấy các "đường nét" mạnh nhất bất kể âm hay dương:
   `hash_H = np.abs(cH) > np.median(np.abs(cH))`
3. Duỗi thẳng (flatten) và nối 4 mảng thành 1 vector nhị phân 1D (độ dài 256 x 4 = 1024 bits).

### 2.4. So Sánh Hamming
- `distance = np.sum(hash1 != hash2)`
- `similarity = 1.0 - (distance / 1024)`

---

## 3. Các API Endpoints (`web/api/index.py`)

| Route | Payload (JSON) | Chức năng |
|---|---|---|
| `POST /api/compare` | `image1`, `image2`, `wavelet` | Tính toán wavelet, hash, trả về similarity %, match_level (exact/similar/none) và các hình ảnh base64 (cA, cH, cV, cD, diff_preview). |
| `POST /api/compare-wavelets`| `image1`, `image2` | Lặp qua mảng wavelet hỗ trợ (haar, db2, db4, sym2...) để so sánh và trả về array kết quả. |
| `POST /api/search` | `query_image`, `wavelet` | Đọc toàn bộ ảnh trong `database/`, tính hash từng ảnh, so sánh với query image, trả về tối đa 48 ảnh giống nhất. |
| `GET /api/samples` | - | Trả về mảng tên file ngẫu nhiên (max 8) từ database để test UI. |

---

## 4. Frontend Implementation (`web/app.js`)

1. **Khắc phục lỗi dung lượng:** Hàm `handleFile` khi đọc ảnh bằng FileReader sẽ load vào 1 object `Image()`, sau đó vẽ lên `<canvas width="256" height="256">`. Cuối cùng xuất ra `canvas.toDataURL('image/jpeg', 0.8)`. Bắt buộc phải làm bước này để tránh lỗi Payload Too Large khi triển khai serverless.
2. **Quản lý trạng thái:** Dùng các biến toàn cục `image1Data`, `image2Data`, `searchImageData` để lưu Base64 chuẩn bị submit.
3. **DOM Rendering:** Tự động build DOM grid từ mảng kết quả của `/api/search` (bao gồm filename, distance, similarity %). Đổi màu badge (xanh lá/vàng/đỏ) dựa vào `match_level`.
4. **Visual UI:** Vòng cung SVG (Circle Progress) thể hiện tỷ lệ %; Các ô hình wavelet `cA, cH, cV, cD` lấy chuỗi "data:image/png;base64,..." gán thẳng vào thẻ `<img>`.

---

## 5. Triển Khai (Deployment)

File `vercel.json` định tuyến các request:
```json
{
  "builds": [
    { "src": "api/index.py", "use": "@vercel/python" },
    { "src": "index.html", "use": "@vercel/static" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.py" },
    { "source": "/(.*)", "destination": "/$1" }
  ]
}
```
File `requirements.txt` phải khóa phiên bản thư viện để tránh lỗi (VD: `numpy==1.26.*`, `flask==3.1.*`, `PyWavelets==1.8.*`).
