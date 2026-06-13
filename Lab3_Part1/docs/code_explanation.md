# 📖 Giải Thích Code Chi Tiết — Bài Thực Hành 4: Wavelet Image Hashing

> **File này giải thích từng phần code** trong notebook `lab4_wavelet_hashing.ipynb` để giúp hiểu rõ cách hoạt động của thuật toán so sánh tương đồng hình ảnh sử dụng Wavelet.

---

## Mục Lục

1. [Import & Cấu Hình](#1-import--cấu-hình)
2. [Bước 1: Chuẩn Bị Dữ Liệu](#2-bước-1-chuẩn-bị-dữ-liệu)
3. [Bước 2: Trích Xuất Wavelet (DWT)](#3-bước-2-trích-xuất-wavelet-dwt)
4. [Bước 3: Tạo Mã Băm (Hash)](#4-bước-3-tạo-mã-băm-hash)
5. [Bước 4: So Sánh Hamming Distance](#5-bước-4-so-sánh-hamming-distance)
6. [Bước 5: Đánh Giá (Metrics & ROC)](#6-bước-5-đánh-giá-metrics--roc)
7. [Phần Nâng Cao: So Sánh Wavelet](#7-phần-nâng-cao-so-sánh-wavelet)

---

## 1. Import & Cấu Hình

### Thư viện sử dụng

```python
import pywt        # PyWavelets — thư viện wavelet chính
import cv2          # OpenCV — đọc/ghi/xử lý ảnh
import numpy as np  # NumPy — xử lý mảng/ma trận
import matplotlib.pyplot as plt  # Vẽ biểu đồ
from sklearn.metrics import ...  # Các metrics đánh giá
```

| Thư viện | Vai trò cụ thể |
|:---------|:---------------|
| `pywt` | Thực hiện biến đổi wavelet rời rạc 2D (`pywt.wavedec2`). Đây là thư viện cốt lõi. |
| `cv2` (OpenCV) | Đọc ảnh từ file (`cv2.imread`), resize (`cv2.resize`), chuyển grayscale. |
| `numpy` | Xử lý ma trận pixel, tính toán số học trên mảng. |
| `matplotlib` | Trực quan hóa: hiển thị ảnh, vẽ histogram, ROC curve. |
| `sklearn.metrics` | Tính accuracy, confusion matrix, ROC curve, AUC. |

### Các hằng số cấu hình

```python
IMG_SIZE = (256, 256)   # Tất cả ảnh được resize về kích thước này
WAVELET = 'haar'        # Loại wavelet mặc định (Haar — đơn giản nhất)
DWT_LEVEL = 2           # Phân tích 2 mức (level)
```

**Tại sao `IMG_SIZE = (256, 256)`?**
- Tất cả ảnh phải cùng kích thước để tạo hash cùng độ dài.
- 256×256 là kích thước phổ biến, đủ chi tiết mà không quá nặng.
- Nếu ảnh có kích thước khác nhau, hash sẽ có độ dài khác nhau → không thể so sánh Hamming.

**Tại sao `WAVELET = 'haar'`?**
- Haar là wavelet đơn giản nhất, dễ hiểu, tốc độ nhanh.
- Phù hợp cho bài tập mức intermediate.
- Phần nâng cao sẽ thử các wavelet khác.

**Tại sao `DWT_LEVEL = 2`?**
- Level 1: ảnh 256×256 → hệ số 128×128 (chi tiết cao)
- Level 2: ảnh 256×256 → hệ số 64×64 (tổng quát hơn)
- Level 2 cho hash ngắn hơn (64×64 = 4096 bit), dễ so sánh.

---

## 2. Bước 1: Chuẩn Bị Dữ Liệu

### Hàm `generate_synthetic_images()`

Hàm này tạo ảnh mẫu tự động nếu chưa có ảnh thật, bao gồm:

**Ảnh tương tự (Similar) — cùng đối tượng, khác biến thể:**

| Ảnh | Biến thể | Cách tạo |
|:----|:---------|:---------|
| `rect_original.png` | Gốc | Hình chữ nhật trắng trên nền đen |
| `rect_rotated.png` | Xoay 15° | `cv2.getRotationMatrix2D` + `cv2.warpAffine` |
| `rect_noisy.png` | Thêm nhiễu | Cộng nhiễu Gaussian (σ=25) |
| `rect_bright.png` | Sáng hơn | Cộng +50 vào mỗi pixel |
| `rect_scaled.png` | Scale | Hình chữ nhật lớn hơn |
| `circle_original.png` | Gốc | Hình tròn trắng |
| `circle_noisy.png` | Nhiễu | Hình tròn + nhiễu Gaussian |
| `circle_moved.png` | Dịch chuyển | Hình tròn tâm khác |

**Ảnh không tương tự (Dissimilar) — hình dạng hoàn toàn khác:**
- Tam giác, Ngôi sao, Gradient ngang, Gradient dọc, Bàn cờ, Đường chéo

### Hàm `load_and_preprocess()`

```python
def load_and_preprocess(image_path, size=(256, 256)):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)  # ① Đọc ảnh grayscale
    img = cv2.resize(img, size)                          # ② Resize về kích thước chuẩn
    return img
```

**Giải thích từng dòng:**

1. **`cv2.IMREAD_GRAYSCALE`**: Đọc ảnh dưới dạng xám (1 kênh, 0-255). Wavelet hoạt động trên ảnh grayscale.
2. **`cv2.resize(img, size)`**: Đảm bảo tất cả ảnh cùng kích thước → hash cùng độ dài → có thể so sánh Hamming.

---

## 3. Bước 2: Trích Xuất Wavelet (DWT)

### Hàm `extract_wavelet()`

```python
def extract_wavelet(img, wavelet='haar', level=2):
    coeffs = pywt.wavedec2(img.astype(np.float64), wavelet, level=level)
    return coeffs
```

**Giải thích chi tiết:**

#### `pywt.wavedec2()` — Biến đổi Wavelet Rời Rạc 2D

Hàm này thực hiện **phân tích đa mức (multi-level decomposition)** trên ảnh 2D.

**Input:** Ma trận ảnh 2D (256×256 pixel)

**Output:** Danh sách hệ số wavelet:
```
coeffs = [cA_2, (cH_2, cV_2, cD_2), (cH_1, cV_1, cD_1)]
          ^^^^   ^^^^^^^^^^^^^^^^     ^^^^^^^^^^^^^^^^
        Level 2   Level 2 detail      Level 1 detail
        (64×64)   (64×64 mỗi cái)    (128×128 mỗi cái)
```

#### Quá trình phân tích (Level 2):

```
Ảnh gốc (256×256)
    │
    ├── Level 1: Chia thành 4 sub-band (mỗi cái 128×128)
    │   ├── cA₁ (Approximation) ─── Thông tin tổng thể
    │   ├── cH₁ (Horizontal)    ─── Cạnh ngang
    │   ├── cV₁ (Vertical)      ─── Cạnh dọc
    │   └── cD₁ (Diagonal)      ─── Cạnh chéo
    │
    └── Level 2: Phân tích tiếp cA₁ thành 4 sub-band (mỗi cái 64×64)
        ├── cA₂ (Approximation) ─── Thông tin TỔ QUÁT nhất ← DÙNG CHO HASH
        ├── cH₂ (Horizontal)
        ├── cV₂ (Vertical)
        └── cD₂ (Diagonal)
```

**Tại sao dùng `img.astype(np.float64)`?**
- Ảnh đọc vào là `uint8` (0-255)
- Phép tính wavelet cần `float` để tránh tràn số và mất precision
- `float64` đảm bảo độ chính xác cao

### Hàm `visualize_wavelet()`

Hiển thị 5 panel:
1. **Ảnh gốc** — để so sánh
2. **cA (Approximation)** — bản thu nhỏ mờ của ảnh gốc, chứa thông tin tổng thể
3. **cH (Horizontal)** — highlight các cạnh ngang (gradient theo phương ngang)
4. **cV (Vertical)** — highlight các cạnh dọc
5. **cD (Diagonal)** — highlight các cạnh chéo

> 💡 **Ý nghĩa thực tế:** cA chứa "bản tóm tắt" của ảnh → dùng để tạo hash.
> cH, cV, cD chứa chi tiết biên/cạnh → hữu ích cho edge detection, nhưng không dùng cho hash cơ bản.

---

## 4. Bước 3: Tạo Mã Băm (Hash)

### Hàm `create_wavelet_hash()`

```python
def create_wavelet_hash(coeffs):
    approx = coeffs[0]                                    # ① Lấy cA (approximation)
    mean_val = np.mean(approx)                             # ② Tính trung bình
    binary_hash = (approx >= mean_val).astype(np.uint8)    # ③ Lượng tử hóa
    return binary_hash.flatten()                           # ④ Duỗi phẳng thành 1D
```

**Giải thích từng bước:**

### Bước ①: Lấy hệ số xấp xỉ `coeffs[0]`

```
coeffs = [cA_2, (cH_2, cV_2, cD_2), (cH_1, cV_1, cD_1)]
          ^^^^
       coeffs[0] = cA_2 (ma trận 64×64)
```

Tại sao chỉ dùng `cA`?
- `cA` chứa thông tin **tổng thể** (low-frequency) của ảnh
- Hai ảnh "tương tự" sẽ có `cA` gần giống nhau
- Các chi tiết nhỏ (nhiễu, thay đổi nhẹ) nằm ở cH, cV, cD → bị bỏ qua → hash ổn định hơn

### Bước ②: Tính trung bình

```python
mean_val = np.mean(approx)  # Trung bình tất cả 64×64 = 4096 giá trị
```

Giá trị trung bình dùng làm **ngưỡng lượng tử hóa**. Đây là cách đơn giản nhất.

### Bước ③: Lượng tử hóa (Quantization)

```python
binary_hash = (approx >= mean_val).astype(np.uint8)
```

Ý nghĩa:
```
Nếu hệ số wavelet >= trung bình  →  1
Nếu hệ số wavelet <  trung bình  →  0
```

Ví dụ:
```
Ma trận cA:           mean = 120.5         Hash:
┌─────┬─────┬─────┐                    ┌───┬───┬───┐
│ 150 │  80 │ 200 │                    │ 1 │ 0 │ 1 │
├─────┼─────┼─────┤   ── ngưỡng ──→   ├───┼───┼───┤
│  50 │ 130 │  90 │                    │ 0 │ 1 │ 0 │
└─────┴─────┴─────┘                    └───┴───┴───┘
```

### Bước ④: Duỗi phẳng (Flatten)

```python
binary_hash.flatten()
# Ma trận 64×64 → mảng 1D có 4096 phần tử
# [1, 0, 1, 0, 1, 0, ...]
```

**Kết quả cuối:** Mỗi ảnh được biểu diễn bằng một chuỗi **4096 bit** (0 và 1).

> 💡 **Ý tưởng cốt lõi:** Hai ảnh tương tự → cA tương tự → hash tương tự → ít bit khác nhau.

---

## 5. Bước 4: So Sánh Hamming Distance

### Hàm `hamming_distance()`

```python
def hamming_distance(hash1, hash2):
    distance = int(np.sum(hash1 != hash2))          # Đếm số bit khác nhau
    similarity = 1.0 - (distance / len(hash1))       # Tính tỷ lệ giống nhau
    return distance, similarity
```

**Giải thích:**

#### `np.sum(hash1 != hash2)` — Đếm bit khác nhau

```
hash1 = [1, 0, 1, 1, 0, 0, 1, 0]
hash2 = [1, 0, 0, 1, 1, 0, 1, 0]
         ─  ─  ✗  ─  ✗  ─  ─  ─   → 2 bit khác nhau

hash1 != hash2 = [False, False, True, False, True, False, False, False]
np.sum(...)    = 2    ← Hamming Distance
```

#### Similarity Score

```
similarity = 1 - (distance / total_bits)
           = 1 - (2 / 8)
           = 0.75    → 75% giống nhau
```

| Similarity | Ý nghĩa |
|:----------:|:---------|
| 1.0 | Hai ảnh **hoàn toàn giống** (hash identique) |
| 0.9+ | Rất tương tự |
| 0.7-0.9 | Tương tự vừa |
| < 0.5 | Khác biệt nhiều |
| 0.0 | Hoàn toàn đối lập |

### Cách tạo cặp ảnh (Pairs)

Code tạo 3 loại cặp:

```python
# 1) Cặp tương tự: Tổ hợp C(n,2) từ ảnh similar
for img1, img2 in combinations(similar_names, 2):
    pairs.append((img1, img2))
    labels.append(1)  # label = 1 → tương tự

# 2) Cặp không tương tự: 1 similar × 1 dissimilar
for s_img in similar_names:
    for d_img in dissimilar_names:
        pairs.append((s_img, d_img))
        labels.append(0)  # label = 0 → không tương tự

# 3) Cặp dissimilar với nhau
for img1, img2 in combinations(dissimilar_names, 2):
    pairs.append((img1, img2))
    labels.append(0)
```

---

## 6. Bước 5: Đánh Giá (Metrics & ROC)

### Hàm `evaluate_with_threshold()`

**Cơ chế phân loại:**
```
Nếu similarity >= threshold  →  Dự đoán "Tương tự" (1)
Nếu similarity <  threshold  →  Dự đoán "Không tương tự" (0)
```

**Confusion Matrix:**

```
                      Dự đoán
                  Tương tự   Không tương tự
Thực tế
  Tương tự          TP            FN
  Không tương tự    FP            TN
```

| Ký hiệu | Tên | Ý nghĩa |
|:--------:|:----|:---------|
| **TP** | True Positive | Đúng là tương tự, đoán đúng tương tự |
| **TN** | True Negative | Đúng là không tương tự, đoán đúng không tương tự |
| **FP** | False Positive | Thực tế không tương tự, nhưng đoán nhầm là tương tự |
| **FN** | False Negative | Thực tế tương tự, nhưng đoán nhầm là không tương tự |

### Các Metrics

#### Accuracy (Độ chính xác)

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

Tỷ lệ dự đoán đúng trên tổng số cặp. Ví dụ: Accuracy = 0.85 → 85% cặp được phân loại đúng.

#### Sensitivity / Recall (Độ nhạy)

```
Sensitivity = TP / (TP + FN)
```

Trong các cặp **thực sự tương tự**, bao nhiêu % được phát hiện đúng? Con số này quan trọng khi **bỏ sót** là nghiêm trọng.

#### Specificity (Độ đặc hiệu)

```
Specificity = TN / (TN + FP)
```

Trong các cặp **thực sự không tương tự**, bao nhiêu % được phân loại đúng? Con số này quan trọng khi **báo nhầm** là nghiêm trọng.

### ROC Curve (Receiver Operating Characteristic)

```python
fpr, tpr, thresholds = roc_curve(labels, similarities)
roc_auc = auc(fpr, tpr)
```

**ROC Curve là gì?**
- Đồ thị thể hiện mối quan hệ giữa **True Positive Rate (TPR)** và **False Positive Rate (FPR)** khi thay đổi ngưỡng (threshold).
- **Trục X:** FPR = FP / (FP + TN) — tỷ lệ báo nhầm
- **Trục Y:** TPR = TP / (TP + FN) — tỷ lệ phát hiện đúng (= Sensitivity)

**AUC (Area Under Curve):**

| AUC | Đánh giá |
|:---:|:---------|
| 1.0 | Hoàn hảo — phân loại đúng 100% |
| 0.9-1.0 | Xuất sắc |
| 0.8-0.9 | Tốt |
| 0.7-0.8 | Khá |
| 0.5 | Ngẫu nhiên — không có khả năng phân loại |
| < 0.5 | Tệ hơn ngẫu nhiên |

**Youden's J statistic — Chọn ngưỡng tối ưu:**
```python
j_scores = tpr - fpr
best_idx = np.argmax(j_scores)
best_threshold = thresholds[best_idx]
```

Youden's J = TPR - FPR. Ngưỡng tại điểm J cao nhất là ngưỡng tối ưu (maximize True Positive, minimize False Positive).

---

## 7. Phần Nâng Cao: So Sánh Wavelet

### Các loại wavelet được thử nghiệm

| Wavelet | Tên đầy đủ | Đặc điểm | Khi nào dùng? |
|:--------|:-----------|:---------|:--------------|
| `haar` | Haar | Bộ lọc ngắn nhất (2 tap), tính toán nhanh, phát hiện cạnh sắc | Ảnh có biên rõ ràng, cần tốc độ |
| `db2` | Daubechies-2 | Mượt hơn Haar (4 tap), cân bằng tốc độ/chất lượng | Đa mục đích |
| `db4` | Daubechies-4 | Bộ lọc dài (8 tap), chi tiết hơn | Ảnh tự nhiên phức tạp |
| `sym2` | Symlet-2 | Gần đối xứng, ít artifact hơn Daubechies | Khi cần ít sai lệch |
| `coif1` | Coiflet-1 | Cả wavelet và scaling function đều gần đối xứng | Ảnh mượt, gradient đều |
| `bior1.3` | Biorthogonal | Đối xứng hoàn hảo, dùng 2 bộ lọc khác nhau cho phân tích/tổng hợp | Nén ảnh, khi cần tái tạo hoàn hảo |

### Cách so sánh

Code lặp qua từng loại wavelet:
```python
for wv in ['haar', 'db2', 'db4', 'sym2', 'coif1', 'bior1.3']:
    # 1. Trích xuất wavelet với loại wavelet khác nhau
    # 2. Tạo hash
    # 3. Tính similarity cho tất cả cặp
    # 4. Tính ROC AUC
    # 5. So sánh
```

Wavelet có **AUC cao nhất** = wavelet phân loại tốt nhất cho tập dữ liệu hiện tại.

---

## Tổng Kết: Toàn Bộ Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    WAVELET IMAGE HASHING                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Ảnh gốc (bất kỳ kích thước, màu)                               │
│      │                                                           │
│      ▼                                                           │
│  [Bước 1] Tiền xử lý                                            │
│      │  ├── Chuyển Grayscale (cv2.IMREAD_GRAYSCALE)              │
│      │  └── Resize 256×256  (cv2.resize)                         │
│      ▼                                                           │
│  [Bước 2] DWT - Biến Đổi Wavelet                                │
│      │  └── pywt.wavedec2(img, 'haar', level=2)                  │
│      │      → coeffs = [cA(64×64), (cH,cV,cD), (cH,cV,cD)]     │
│      ▼                                                           │
│  [Bước 3] Lượng Tử Hóa → Hash                                   │
│      │  ├── Lấy cA (64×64 = 4096 giá trị)                       │
│      │  ├── Tính mean(cA)                                        │
│      │  └── >= mean → 1, < mean → 0                              │
│      │  → Hash: chuỗi 4096 bit [1,0,1,1,0,...]                  │
│      ▼                                                           │
│  [Bước 4] So Sánh Hamming                                       │
│      │  ├── Đếm số bit khác nhau giữa 2 hash                    │
│      │  └── Similarity = 1 - (khác/tổng)                        │
│      ▼                                                           │
│  [Bước 5] Đánh Giá                                              │
│      ├── Chọn threshold                                          │
│      ├── Tính Accuracy, Sensitivity, Specificity                 │
│      └── Vẽ ROC Curve, tính AUC                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cách Sử Dụng Notebook

### Với ảnh mẫu (synthetic)
Chỉ cần **Run All** — notebook tự tạo ảnh mẫu và chạy toàn bộ pipeline.

### Với ảnh thật của bạn
1. Đặt ảnh tương tự vào: `data/input/similar/`
2. Đặt ảnh không tương tự vào: `data/input/dissimilar/`
3. **Run All** — notebook tự phát hiện ảnh thật và xử lý

### Tinh chỉnh
- Thay đổi `IMG_SIZE` để thử kích thước khác (128×128, 512×512)
- Thay đổi `WAVELET` để thử loại wavelet khác
- Thay đổi `DWT_LEVEL` để thử số mức phân tích khác
