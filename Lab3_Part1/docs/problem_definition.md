# Phát Biểu Bài Toán: So Sánh Sự Tương Đồng Hình Ảnh Sử Dụng Wavelet

---

## 1. Tổng Quan

**Tên bài tập:** Bài thực hành 4 — So sánh sự tương đồng của các hình ảnh sử dụng Wavelet, Python  
**Môn học:** Xử Lý Ảnh (Image Processing)  
**Mục tiêu chính:** Sử dụng biến đổi wavelet rời rạc (DWT — Discrete Wavelet Transform) để trích xuất đặc trưng hình ảnh, tạo mã băm (hash), và so sánh mức độ tương đồng giữa các cặp hình ảnh.

---

## 2. Bối Cảnh & Kiến Thức Nền Tảng

### 2.1. Wavelet Transform là gì?

Biến đổi wavelet là phương pháp phân tích tín hiệu/ảnh theo cả **miền tần số** và **miền không gian** đồng thời. Khi áp dụng DWT lên một hình ảnh 2D, ta nhận được 4 thành phần (sub-bands):

| Sub-band | Tên gọi                    | Ý nghĩa                                  |
| :------: | :-------------------------- | :---------------------------------------- |
| **cA**   | Approximation (xấp xỉ)     | Thông tin tổng thể, tần số thấp           |
| **cH**   | Horizontal detail (chi tiết ngang) | Các cạnh ngang                      |
| **cV**   | Vertical detail (chi tiết dọc)     | Các cạnh dọc                        |
| **cD**   | Diagonal detail (chi tiết chéo)    | Các cạnh chéo                       |

### 2.2. Wavelet Hashing là gì?

Wavelet hashing là kỹ thuật tạo một "dấu vân tay" (fingerprint) cho hình ảnh dựa trên hệ số wavelet:
1. Áp dụng DWT để lấy hệ số wavelet
2. Lượng tử hóa (quantize) các hệ số: nếu hệ số ≥ trung bình → `1`, ngược lại → `0`
3. Kết quả là một chuỗi nhị phân (binary string) đại diện cho ảnh

### 2.3. Khoảng cách Hamming

Khoảng cách Hamming giữa hai chuỗi nhị phân = **số vị trí mà hai chuỗi khác nhau**.
- Khoảng cách nhỏ → hai ảnh **tương tự**
- Khoảng cách lớn → hai ảnh **khác biệt**

---

## 3. Đầu Vào (Input)

### 3.1. Tập dữ liệu hình ảnh

Chuẩn bị một tập hợp ảnh lưu tại `data/input/`, bao gồm:

- **Ảnh cặp tương tự (Similar pairs):**
  - Cùng một đối tượng, khác góc chụp
  - Cùng một đối tượng, khác mức độ nhiễu (noise)
  - Cùng một đối tượng, khác độ sáng/tương phản
  - Cùng một đối tượng, khác kích thước (scale)

- **Ảnh cặp không tương tự (Dissimilar pairs):**
  - Các đối tượng hoàn toàn khác nhau

### 3.2. Yêu cầu dữ liệu

- Tối thiểu **10 cặp ảnh tương tự** và **10 cặp ảnh không tương tự**
- Định dạng: `.jpg`, `.png`, hoặc `.bmp`
- Kích thước: Không giới hạn (code sẽ resize về kích thước chuẩn trước khi xử lý)
- Gắn nhãn (label) cho từng cặp: `1` = tương tự, `0` = không tương tự

---

## 4. Đầu Ra (Output)

### 4.1. Kết quả Notebook

| Output                    | Mô tả                                                           |
| :------------------------ | :--------------------------------------------------------------- |
| **Wavelet coefficients**  | Hiển thị trực quan hệ số wavelet (cA, cH, cV, cD) của mẫu ảnh  |
| **Hash strings**          | Mã băm nhị phân của từng ảnh                                    |
| **Hamming distances**     | Ma trận/bảng khoảng cách Hamming giữa các cặp ảnh               |
| **Confusion matrix**      | Ma trận nhầm lẫn (TP, TN, FP, FN)                               |
| **Metrics**               | Accuracy, Sensitivity (Recall), Specificity                      |
| **ROC Curve**             | Đồ thị ROC đánh giá hiệu suất thuật toán                        |

### 4.2. Kết quả Web App (Phần mở rộng)

- Giao diện cho phép upload 2 ảnh
- Hiển thị wavelet decomposition trực quan
- Tính và hiển thị Hamming distance
- Kết luận: "Tương tự" hoặc "Không tương tự" dựa trên ngưỡng (threshold)

---

## 5. Luồng Xử Lý Chính (Pipeline)

```
┌────────────┐    ┌──────────────────┐    ┌──────────────┐    ┌──────────────────┐    ┌────────────┐
│  Đọc ảnh   │ →  │ Tiền xử lý       │ →  │ DWT (pywt)   │ →  │ Lượng tử hóa     │ →  │ Hash nhị   │
│  (cv2/PIL) │    │ - Grayscale      │    │ - wavelet    │    │ - threshold      │    │  phân      │
│            │    │ - Resize         │    │ - level      │    │ - binary string  │    │            │
└────────────┘    └──────────────────┘    └──────────────┘    └──────────────────┘    └────────────┘
                                                                                           │
                                                                                           ▼
                                          ┌──────────────┐    ┌──────────────────┐    ┌────────────┐
                                          │ Đánh giá     │ ←  │ So sánh Hamming  │ ←  │ Ghép cặp   │
                                          │ - Accuracy   │    │ - Distance       │    │ ảnh        │
                                          │ - ROC Curve  │    │ - Threshold      │    │            │
                                          └──────────────┘    └──────────────────┘    └────────────┘
```

---

## 6. Các Bước Thực Hiện Chi Tiết

### Bước 1: Chuẩn Bị Dữ Liệu

- Thu thập / tạo tập ảnh (có thể tải từ internet hoặc tự chụp)
- Tổ chức vào `data/input/` theo cấu trúc rõ ràng
- Tạo file metadata (CSV hoặc dict trong code) ghi nhận nhãn cặp ảnh

### Bước 2: Trích Xuất Wavelet Đặc Biệt

```python
import pywt
import cv2
import numpy as np

def extract_wavelet_features(image_path, wavelet='haar', level=2):
    """
    Trích xuất hệ số wavelet từ ảnh.
    
    Args:
        image_path: Đường dẫn đến file ảnh
        wavelet: Loại wavelet (mặc định: 'haar')
        level: Số mức phân tích DWT (mặc định: 2)
    
    Returns:
        coeffs: Hệ số wavelet
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (256, 256))  # Chuẩn hóa kích thước
    coeffs = pywt.wavedec2(img, wavelet, level=level)
    return coeffs
```

### Bước 3: Tạo Mã Băm

```python
def create_wavelet_hash(coeffs):
    """
    Tạo mã băm nhị phân từ hệ số wavelet.
    
    Lượng tử hóa: hệ số >= trung bình → 1, ngược lại → 0
    """
    # Lấy hệ số xấp xỉ (cA)
    approx = coeffs[0]
    # Tính trung bình
    mean_val = np.mean(approx)
    # Lượng tử hóa
    binary_hash = (approx >= mean_val).astype(int).flatten()
    return binary_hash
```

### Bước 4: So Sánh Hàm Băm

```python
def hamming_distance(hash1, hash2):
    """
    Tính khoảng cách Hamming giữa 2 hash.
    
    Returns:
        distance: Số bit khác nhau
        similarity: Tỷ lệ tương đồng (0.0 - 1.0)
    """
    distance = np.sum(hash1 != hash2)
    similarity = 1 - (distance / len(hash1))
    return distance, similarity
```

### Bước 5: Đánh Giá

- Chọn ngưỡng (threshold) để phân loại "tương tự" / "không tương tự"
- Tính các metrics:
  - **Accuracy** = (TP + TN) / (TP + TN + FP + FN)
  - **Sensitivity (Recall)** = TP / (TP + FN)
  - **Specificity** = TN / (TN + FP)
- Vẽ đường cong ROC bằng `sklearn.metrics.roc_curve`

---

## 7. Phần Mở Rộng: Web App

### 7.1. Tổng Quan Web App

**Tên:** Wavelet Image Similarity Studio  
**Mục tiêu:** Xây dựng ứng dụng web chạy hoàn toàn trên trình duyệt để demo tìm kiếm / so sánh hình ảnh tương tự dựa trên wavelet hash.

### 7.2. Tính Năng

1. **Upload & So sánh 2 ảnh:** Tải lên 2 ảnh, hiển thị wavelet decomposition và kết quả Hamming distance
2. **Tìm kiếm ảnh tương tự:** Upload 1 ảnh query, tìm trong bộ ảnh có sẵn những ảnh tương tự nhất
3. **Trực quan hóa wavelet:** Hiển thị các sub-band (cA, cH, cV, cD) dạng hình ảnh

### 7.3. Kiến Trúc

- **Client-side only** — Không backend, không database
- Xử lý wavelet trong browser bằng JavaScript thuần (hoặc WebAssembly nếu cần)
- Giao diện dark mode, hiện đại, responsive

### 7.4. Giới hạn Web App (Out of Scope)

- ❌ Không backend / server xử lý
- ❌ Không database / lưu trữ dữ liệu người dùng
- ❌ Không đăng nhập / xác thực
- ❌ Không sử dụng API bên ngoài

---

## 8. Tiêu Chí Hoàn Thành (Definition of Done)

### 8.1. Phần Notebook

- [ ] Code chạy không lỗi trên Python 3.10+
- [ ] Trích xuất wavelet thành công cho tất cả ảnh trong dataset
- [ ] Tạo mã băm cho từng ảnh
- [ ] Tính khoảng cách Hamming cho tất cả các cặp ảnh
- [ ] Hiển thị trực quan hệ số wavelet (ít nhất 2 ảnh mẫu)
- [ ] Tính đúng các metrics: Accuracy, Sensitivity, Specificity
- [ ] Vẽ đường cong ROC
- [ ] Code có docstring và comment đầy đủ
- [ ] Output hiển thị dạng bảng rõ ràng

### 8.2. Phần Web App

- [ ] Giao diện responsive (desktop & mobile)
- [ ] Upload 2 ảnh và hiển thị kết quả so sánh
- [ ] Hiển thị wavelet decomposition trực quan
- [ ] Hiển thị Hamming distance và kết luận tương tự/không tương tự
- [ ] Giao diện đẹp, chuyên nghiệp, dark mode
- [ ] Chạy mượt, không crash trình duyệt

---

> 📌 **Tham khảo thêm:** Đọc file `docs/implement_plan.md` để biết kế hoạch triển khai chi tiết và thứ tự các bước thực hiện.
