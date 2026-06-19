# Implementation Plan: Wavelet Image Similarity

---

## 1. Thông Tin Dự Án

| Mục           | Chi tiết              |
| ------------- | --------------------- |
| **Ngôn ngữ**  | Python 3, JavaScript (ES6) |
| **Framework** | Flask (Backend)       |
| **Xử lý ảnh** | PyWavelets, NumPy, Pillow |
| **Frontend**  | HTML5, CSS3 (vanilla), JS thuần |
| **Đóng gói / Deploy** | Vercel Serverless Function |

> **Hướng dẫn Prompt cho AI khác (AI Handoff Prompt):**
> *"Tôi cần xây dựng một ứng dụng web xử lý ảnh bằng Flask và HTML/JS thuần. Dự án tên là Wavelet Studio. Ứng dụng sử dụng thuật toán biến đổi Wavelet (DWT 2D mức 4) và khoảng cách Hamming để tìm ra sự tương đồng giữa 2 hình ảnh. Cấu trúc dự án bao gồm thư mục `web/` chứa file `index.html`, `style.css`, `app.js` cho frontend, và `api/index.py` cho Flask backend. Server không lưu trữ ảnh upload mà frontend sẽ mã hóa Base64 và gửi qua JSON REST API. Ứng dụng cũng hỗ trợ tìm kiếm ảnh tương đồng trong một thư mục `database/`. Ứng dụng cần hỗ trợ deploy serverless qua `vercel.json`."*

---

## 2. Cấu Trúc Thư Mục Thực Tế

```text
Lab3_Part1/
│
├── web/
│   ├── api/
│   │   └── index.py            # API Backend chính (Flask), chứa logic Wavelet
│   ├── app.js                  # Frontend logic (xử lý UI, gọi API)
│   ├── index.html              # Giao diện chính của ứng dụng
│   ├── style.css               # Styling cho giao diện (Vanilla CSS)
│   ├── requirements.txt        # Các thư viện Python (Flask, Numpy, PyWavelets, Pillow)
│   └── vercel.json             # Cấu hình deploy Vercel
│
├── database/                   # Thư mục chứa các ảnh mẫu dùng để tìm kiếm (Image Search)
├── data/                       # Chứa dataset gốc nghiệm thu
├── notebooks/                  # Các file Jupyter (Pynb) để thử nghiệm thuật toán
└── docs/                       # Tài liệu dự án
```

---

## 3. Chi Tiết Các Route Flask (`web/api/index.py`)

| Route                   | Method | Payload (JSON) | Mô tả                                                     |
| ----------------------- | ------ | -------------- | --------------------------------------------------------- |
| `/` và `/<path:path>`   | GET    | -              | Phục vụ file tĩnh (HTML, CSS, JS) khi chạy local. Vercel tự xử lý. |
| `/api/compare`          | POST   | `image1`, `image2`, `wavelet` | Decode base64, tính toán Wavelet & Hash, trả về % giống nhau, khoảng cách Hamming và các ảnh sub-bands. |
| `/api/compare-wavelets` | POST   | `image1`, `image2` | Lặp qua danh sách Wavelets được hỗ trợ (haar, db2, sym2...) để so sánh và trả về mảng kết quả. |
| `/api/search`           | POST   | `query_image`, `wavelet` | Lặp qua thư mục `database/`, tính hash từng ảnh và so sánh với query image, trả về danh sách top kết quả tốt nhất. |
| `/api/samples`          | GET    | -              | Trả về tên vài file ngẫu nhiên từ `database/` để người dùng test. |

---

## 4. Giải Thuật Cốt Lõi (Thuật Toán Wavelet Hashing)

### 4.1. Tiền Xử Lý Ảnh
```python
def decode_image(b64_string: str):
    # Nhận chuỗi Base64 từ Frontend -> Đọc bằng Pillow
    # 1. Chuyển thành ảnh xám (convert 'L')
    # 2. Resize chuẩn về kích thước 256x256 bằng LANCZOS
    # 3. Trả về Numpy Array 2D
```

### 4.2. Trích Xuất Wavelet
```python
def extract_wavelet(img, wavelet='haar', level=4):
    # Dùng hàm pywt.wavedec2() để biến đổi ảnh 2D qua 4 cấp.
    # Trả về các hệ số: Xấp xỉ (cA) và Chi tiết (cH, cV, cD) của cấp cuối.
```

### 4.3. Tạo Image Hash (Mã Băm)
```python
def create_hash(coeffs):
    # Nhận các ma trận cA, cH, cV, cD
    # 1. So sánh từng pixel trong cA với giá trị Median(cA) -> Trích xuất bố cục tổng thể.
    # 2. Lấy Absolute(cH), Absolute(cV), Absolute(cD) và so sánh với Median của chính nó -> Trích xuất vị trí cạnh/kết cấu nét mạnh nhất.
    # 3. Nối (Concatenate) 4 ma trận nhị phân này lại thành vector 1 chiều (1024 bits).
```

### 4.4. Tính Khoảng Cách Hamming
```python
def hamming(hash1, hash2):
    # dist = số lượng bit khác nhau giữa hash1 và hash2
    # similarity = 1 - (dist / tổng số bit)
    # Trả về dist và sim
```

---

## 5. Luồng Dữ Liệu Frontend ↔ Backend

```text
User kéo thả / tải ảnh 1 và ảnh 2 trên UI (HTML)
        │
        ▼
Javascript FileReader đọc file thành chuỗi "data:image/png;base64,..."
        │
        ▼
JS gom chuỗi base64 và tên loại Wavelet vào object JSON
        │
        ▼
Gửi HTTP POST đến "/api/compare" bằng `fetch()`
        │
        ▼
[FLASK APP] 
  1. Decode JSON -> Lấy base64 string
  2. Xử lý thuật toán Wavelet 
  3. Encode các ảnh trung gian (cA, cH, mã băm) ngược lại thành Base64
  4. Trả kết quả { similarity_pct, image1_info, image2_info... } dạng JSON
        │
        ▼
Javascript nhận JSON response, render % kết quả lên biểu đồ vòng (Circular Progress), vẽ lưới ảnh Sub-band lên UI.
```

---

## 6. Cấu Hình Triển Khai (Deployment)

### 6.1. requirements.txt
Sử dụng các phiên bản thư viện cố định để tránh lỗi trên Vercel:
```text
flask==3.1.*
numpy==1.26.*
PyWavelets==1.8.*
Pillow==11.*
```

### 6.2. vercel.json
Cấu hình để Vercel biết cách chạy thư mục `api/` như một backend và phục vụ frontend tĩnh.
```json
{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.py" },
    { "source": "/(.*)", "destination": "/$1" }
  ]
}
```

---

## 7. Các Điểm Kỹ Thuật Đáng Chú Ý (Lưu ý cho AI / Dev)

1. **Truyền Dữ Liệu Không Trạng Thái (Stateless Data Transfer):** Ảnh không bao giờ được lưu lại thành file `.jpg` trên server. Toàn bộ quá trình từ upload -> process -> response đều bằng chuỗi Base64 lưu trong RAM. Rất phù hợp với kiến trúc Serverless (Vercel).
2. **Xử Lý Nhiễu Bằng Median:** Việc so sánh các hệ số DWT với giá trị Median giúp hệ thống chống chịu tốt trước những thay đổi về độ sáng, độ tương phản của ảnh.
3. **CORS & Pathing:** File `index.py` được đặt trong thư mục `api/` để Vercel tự nhận diện đó là Serverless function. Code local cần có block `@app.route('/')` để serve frontend file.
4. **Resampling Filter:** Dùng `Image.Resampling.LANCZOS` để chất lượng ảnh giảm kích thước (downscale) được sắc nét nhất trước khi chạy thuật toán Wavelet.
