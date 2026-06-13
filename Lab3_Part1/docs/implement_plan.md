# Kế Hoạch Triển Khai: So Sánh Tương Đồng Hình Ảnh Sử Dụng Wavelet

---

## 1. Mục Đích Tài Liệu

Tài liệu này vạch ra **các bước thực hiện cụ thể** để hoàn thành Bài thực hành 4 — bao gồm cả phần Jupyter Notebook (bắt buộc) và phần Web App (mở rộng). Tài liệu tuân thủ đúng phạm vi đã định trong `problem_definition.md` và quy tắc trong `rules.md`.

> 💡 **Dành cho AI:** Khi triển khai, hãy đọc file này theo thứ tự từ trên xuống và thực hiện từng giai đoạn. Không bỏ qua bất kỳ giai đoạn nào.

---

## 2. Cấu Trúc Thư Mục Dự Án

```
Lab3_Part1/
├── README.md
├── rules.md
├── docs/
│   ├── problem_definition.md
│   └── implement_plan.md          ← FILE NÀY
├── data/
│   └── input/
│       ├── similar/               # Các cặp ảnh tương tự
│       │   ├── obj1_angle1.jpg
│       │   ├── obj1_angle2.jpg
│       │   ├── obj2_bright.jpg
│       │   ├── obj2_dark.jpg
│       │   └── ...
│       ├── dissimilar/            # Các ảnh không tương tự
│       │   ├── cat.jpg
│       │   ├── car.jpg
│       │   └── ...
│       └── output/                # Kết quả wavelet, hash, etc.
├── notebooks/
│   └── lab4_wavelet_hashing.ipynb
├── web/
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   ├── package.json
│   ├── vite.config.js
│   └── public/
│       └── sample_images/         # Ảnh mẫu cho web demo
└── khamkhao/                      # Tài liệu tham khảo (bài cũ)
```

---

## 3. Phần I: Jupyter Notebook (BẮT BUỘC)

### Giai Đoạn 1: Setup & Chuẩn Bị Dữ Liệu

| Hạng mục        | Chi tiết                                                                                                                              | Tình trạng |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :---------: |
| **Tạo notebook** | Tạo file `notebooks/lab4_wavelet_hashing.ipynb`                                                                                       | ⬜ Chưa     |
| **Import thư viện** | `pywt`, `cv2`, `numpy`, `matplotlib`, `sklearn.metrics`, `os`, `glob`                                                              | ⬜ Chưa     |
| **Thu thập ảnh** | Chuẩn bị ít nhất 20 ảnh (10 cặp tương tự + 10 cặp không tương tự). Lưu vào `data/input/similar/` và `data/input/dissimilar/`         | ⬜ Chưa     |
| **Tạo metadata** | Tạo dict/CSV chứa thông tin nhãn: `[("img1.jpg", "img2.jpg", 1), ("img3.jpg", "img4.jpg", 0), ...]` — 1=tương tự, 0=không tương tự  | ⬜ Chưa     |

**Code mẫu — Cell 1: Import & Config:**
```python
# ===========================================================
# BÀI THỰC HÀNH 4: SO SÁNH SỰ TƯƠNG ĐỒNG CỦA CÁC HÌNH ẢNH
#                   SỬ DỤNG WAVELET, PYTHON
# ===========================================================

import pywt
import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score, recall_score, roc_curve, auc,
    confusion_matrix, ConfusionMatrixDisplay
)
import os
import glob

# Cấu hình
IMG_SIZE = (256, 256)          # Kích thước chuẩn hóa ảnh
WAVELET = 'haar'               # Loại wavelet sử dụng
DWT_LEVEL = 2                  # Số mức phân tích DWT
DATA_DIR = '../data/input/'    # Thư mục dữ liệu

print("✅ Import thư viện thành công!")
print(f"📐 PyWavelets version: {pywt.__version__}")
print(f"📐 OpenCV version: {cv2.__version__}")
```

---

### Giai Đoạn 2: Trích Xuất Wavelet Đặc Biệt (DWT)

| Hạng mục                        | Chi tiết                                                                                         | Tình trạng |
| :------------------------------- | :----------------------------------------------------------------------------------------------- | :---------: |
| **Hàm đọc & tiền xử lý ảnh**   | Đọc ảnh → Grayscale → Resize về `IMG_SIZE`                                                       | ⬜ Chưa     |
| **Hàm DWT**                     | Áp dụng `pywt.wavedec2()` để phân tích wavelet đa mức                                            | ⬜ Chưa     |
| **Trực quan hóa wavelet**       | Hiển thị 4 sub-bands (cA, cH, cV, cD) cho ít nhất 2 ảnh mẫu bằng `matplotlib`                   | ⬜ Chưa     |

**Code mẫu — Cell 2: Trích xuất wavelet:**
```python
def load_and_preprocess(image_path: str, size: tuple = IMG_SIZE) -> np.ndarray:
    """
    Đọc ảnh từ file, chuyển sang grayscale và resize.
    
    Args:
        image_path: Đường dẫn file ảnh
        size: Kích thước đầu ra (width, height)
    
    Returns:
        Ảnh grayscale đã resize (numpy array)
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Không tìm thấy ảnh: {image_path}")
    img = cv2.resize(img, size)
    return img


def extract_wavelet(img: np.ndarray, wavelet: str = WAVELET, level: int = DWT_LEVEL):
    """
    Áp dụng biến đổi wavelet rời rạc 2D (DWT) cho ảnh.
    
    Args:
        img: Ảnh grayscale (numpy array)
        wavelet: Loại wavelet ('haar', 'db1', 'db2', 'sym2', ...)
        level: Số mức phân tích
    
    Returns:
        coeffs: Danh sách hệ số wavelet [cA_n, (cH_n, cV_n, cD_n), ..., (cH_1, cV_1, cD_1)]
    """
    coeffs = pywt.wavedec2(img, wavelet, level=level)
    return coeffs


def visualize_wavelet(img: np.ndarray, coeffs, title: str = "Wavelet Decomposition"):
    """
    Hiển thị ảnh gốc và 4 sub-bands wavelet.
    """
    fig, axes = plt.subplots(1, 5, figsize=(20, 4))
    
    axes[0].imshow(img, cmap='gray')
    axes[0].set_title('Ảnh gốc')
    axes[0].axis('off')
    
    # Sub-bands từ level 1 (chi tiết nhất)
    cA = coeffs[0]
    cH, cV, cD = coeffs[1]
    
    sub_bands = [cA, cH, cV, cD]
    names = ['cA (Xấp xỉ)', 'cH (Ngang)', 'cV (Dọc)', 'cD (Chéo)']
    
    for i, (band, name) in enumerate(zip(sub_bands, names)):
        axes[i+1].imshow(np.abs(band), cmap='gray')
        axes[i+1].set_title(name)
        axes[i+1].axis('off')
    
    fig.suptitle(title, fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.show()
```

---

### Giai Đoạn 3: Tạo Mã Băm (Wavelet Hash)

| Hạng mục                   | Chi tiết                                                                        | Tình trạng |
| :-------------------------- | :------------------------------------------------------------------------------ | :---------: |
| **Hàm tạo hash**           | Lượng tử hóa hệ số wavelet → chuỗi nhị phân                                    | ⬜ Chưa     |
| **Áp dụng cho toàn bộ ảnh** | Tạo hash cho tất cả ảnh trong dataset, lưu vào dict                            | ⬜ Chưa     |

**Code mẫu — Cell 3: Tạo hash:**
```python
def create_wavelet_hash(coeffs) -> np.ndarray:
    """
    Tạo mã băm nhị phân từ hệ số wavelet.
    
    Phương pháp: Lượng tử hóa hệ số xấp xỉ (cA) bằng ngưỡng trung bình.
    - Hệ số >= trung bình → 1
    - Hệ số < trung bình  → 0
    
    Returns:
        binary_hash: Mảng nhị phân 1D (numpy array of 0s and 1s)
    """
    approx = coeffs[0]  # Lấy hệ số xấp xỉ (cA)
    mean_val = np.mean(approx)
    binary_hash = (approx >= mean_val).astype(np.uint8).flatten()
    return binary_hash


def hash_to_string(binary_hash: np.ndarray) -> str:
    """Chuyển mảng nhị phân thành chuỗi string để hiển thị."""
    return ''.join(map(str, binary_hash))
```

---

### Giai Đoạn 4: So Sánh Hàm Băm (Hamming Distance)

| Hạng mục                  | Chi tiết                                                                                   | Tình trạng |
| :------------------------- | :----------------------------------------------------------------------------------------- | :---------: |
| **Hàm Hamming distance**  | Tính số bit khác nhau giữa 2 hash                                                          | ⬜ Chưa     |
| **Tính cho tất cả cặp**   | Tạo ma trận/bảng khoảng cách Hamming cho toàn bộ cặp ảnh                                   | ⬜ Chưa     |
| **Chọn ngưỡng (threshold)** | Xác định ngưỡng Hamming để phân loại tương tự/không tương tự. Thử nhiều giá trị ngưỡng.  | ⬜ Chưa     |

**Code mẫu — Cell 4: So sánh:**
```python
def hamming_distance(hash1: np.ndarray, hash2: np.ndarray) -> tuple:
    """
    Tính khoảng cách Hamming giữa 2 mã băm.
    
    Args:
        hash1, hash2: Mảng nhị phân cùng kích thước
    
    Returns:
        (distance, similarity):
            - distance: Số bit khác nhau (int)
            - similarity: Tỷ lệ tương đồng (float, 0.0 - 1.0)
    """
    if len(hash1) != len(hash2):
        raise ValueError("Hai hash phải có cùng kích thước!")
    
    distance = int(np.sum(hash1 != hash2))
    similarity = 1.0 - (distance / len(hash1))
    return distance, similarity
```

---

### Giai Đoạn 5: Đánh Giá (Evaluation)

| Hạng mục                   | Chi tiết                                                                                    | Tình trạng |
| :-------------------------- | :------------------------------------------------------------------------------------------ | :---------: |
| **Confusion Matrix**       | Tính TP, TN, FP, FN dựa trên ngưỡng đã chọn                                                | ⬜ Chưa     |
| **Accuracy**               | (TP + TN) / Tổng                                                                            | ⬜ Chưa     |
| **Sensitivity (Recall)**   | TP / (TP + FN)                                                                               | ⬜ Chưa     |
| **Specificity**            | TN / (TN + FP)                                                                               | ⬜ Chưa     |
| **ROC Curve**              | Vẽ đường cong ROC và tính AUC                                                               | ⬜ Chưa     |
| **Bảng tổng kết**          | In bảng tổng hợp tất cả metrics                                                             | ⬜ Chưa     |

**Code mẫu — Cell 5: Đánh giá:**
```python
def evaluate_results(y_true: list, y_scores: list, threshold: float = 0.5):
    """
    Đánh giá kết quả so sánh ảnh.
    
    Args:
        y_true: Nhãn thực tế (1=tương tự, 0=không tương tự)
        y_scores: Điểm tương đồng (similarity scores) cho mỗi cặp
        threshold: Ngưỡng phân loại
    
    Returns:
        dict chứa các metrics
    """
    y_pred = [1 if s >= threshold else 0 for s in y_scores]
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    # Metrics
    accuracy = (tp + tn) / (tp + tn + fp + fn)
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0  # Recall
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
    
    # In kết quả
    print("=" * 50)
    print("📊 KẾT QUẢ ĐÁNH GIÁ")
    print("=" * 50)
    print(f"  Ngưỡng (Threshold):   {threshold:.2f}")
    print(f"  Accuracy:             {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  Sensitivity (Recall): {sensitivity:.4f} ({sensitivity*100:.2f}%)")
    print(f"  Specificity:          {specificity:.4f} ({specificity*100:.2f}%)")
    print(f"  TP={tp}, TN={tn}, FP={fp}, FN={fn}")
    print("=" * 50)
    
    return {
        'accuracy': accuracy,
        'sensitivity': sensitivity,
        'specificity': specificity,
        'confusion_matrix': cm,
        'y_pred': y_pred
    }


def plot_roc_curve(y_true: list, y_scores: list):
    """Vẽ đường cong ROC."""
    fpr, tpr, thresholds = roc_curve(y_true, y_scores)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='#00BFFF', lw=2, label=f'ROC Curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='gray', lw=1, linestyle='--', label='Random Classifier')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12)
    plt.ylabel('True Positive Rate (Sensitivity)', fontsize=12)
    plt.title('📈 Đường Cong ROC — Wavelet Hash Similarity', fontsize=14, fontweight='bold')
    plt.legend(loc='lower right', fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()
    
    print(f"📌 AUC (Area Under Curve) = {roc_auc:.4f}")
    return roc_auc
```

---

## 4. Phần II: Web App (MỞ RỘNG)

### Giai Đoạn 6: Setup Project Web

| Hạng mục           | Chi tiết                                                                                                      | Tình trạng |
| :------------------ | :------------------------------------------------------------------------------------------------------------ | :---------: |
| **Khởi tạo Vite**  | `cd web && npm create vite@latest ./ -- --template vanilla` → Xóa file thừa, giữ HTML/JS/CSS cơ bản          | ⬜ Chưa     |
| **Cấu hình**       | Tạo `vite.config.js` đơn giản, cấu hình `package.json`                                                       | ⬜ Chưa     |

---

### Giai Đoạn 7: Xây Dựng Giao Diện Web

| Hạng mục               | Chi tiết                                                                    | Tình trạng |
| :----------------------- | :-------------------------------------------------------------------------- | :---------: |
| **Layout chính**        | Dark mode, 2 panel: Upload ảnh (trái) + Kết quả (phải)                      | ⬜ Chưa     |
| **Upload component**    | Drag & Drop hoặc click để chọn 2 ảnh                                        | ⬜ Chưa     |
| **Kết quả component**   | Hiển thị wavelet decomposition, Hamming distance, kết luận                  | ⬜ Chưa     |
| **Responsive**          | Hoạt động tốt trên cả desktop và mobile                                    | ⬜ Chưa     |

**Giao diện tham khảo:**
```
┌────────────────────────────────────────────────────────────┐
│  🔬 Wavelet Image Similarity Studio                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │                  │    │                  │             │
│  │   📁 Ảnh 1       │    │   📁 Ảnh 2       │             │
│  │   (Drop/Click)   │    │   (Drop/Click)   │             │
│  │                  │    │                  │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                            │
│  ┌──────────────────────────────────────────┐             │
│  │  📊 Kết Quả So Sánh                      │             │
│  │  ─────────────────────────────────        │             │
│  │  Hamming Distance: 42 / 4096              │             │
│  │  Similarity: 98.97%                       │             │
│  │  Kết luận: ✅ TƯƠNG TỰ                    │             │
│  └──────────────────────────────────────────┘             │
│                                                            │
│  ┌──────────────────────────────────────────┐             │
│  │  🌊 Wavelet Decomposition                 │             │
│  │  [cA] [cH] [cV] [cD]  |  [cA] [cH] [cV] [cD]         │
│  │       Ảnh 1             |       Ảnh 2                  │
│  └──────────────────────────────────────────┘             │
└────────────────────────────────────────────────────────────┘
```

---

### Giai Đoạn 8: Logic Xử Lý Wavelet Trong JavaScript

| Hạng mục                  | Chi tiết                                                                          | Tình trạng |
| :------------------------- | :-------------------------------------------------------------------------------- | :---------: |
| **Đọc ảnh từ Canvas**     | Dùng Canvas API để lấy pixel data từ ảnh upload                                   | ⬜ Chưa     |
| **Grayscale conversion**  | Chuyển ảnh RGB → Grayscale bằng công thức: `0.299*R + 0.587*G + 0.114*B`          | ⬜ Chưa     |
| **Haar wavelet (JS)**     | Implement biến đổi Haar wavelet đơn giản trong JS thuần                           | ⬜ Chưa     |
| **Hash generation**       | Lượng tử hóa hệ số wavelet → hash nhị phân                                       | ⬜ Chưa     |
| **Hamming distance**      | Tính khoảng cách Hamming giữa 2 hash                                              | ⬜ Chưa     |

---

### Giai Đoạn 9: Polish & Deploy

| Hạng mục              | Chi tiết                                                   | Tình trạng |
| :---------------------- | :--------------------------------------------------------- | :---------: |
| **Animations**         | Thêm micro-animations cho UI (fade in, progress bar, ...)  | ⬜ Chưa     |
| **Error handling**     | Xử lý lỗi: file không phải ảnh, ảnh quá lớn, ...          | ⬜ Chưa     |
| **Performance**        | Optimize cho ảnh lớn (resize trước khi xử lý)              | ⬜ Chưa     |
| **Build & Deploy**     | `npm run build` → Deploy lên GitHub Pages hoặc Vercel      | ⬜ Chưa     |

---

## 5. Những Thách Thức Kỹ Thuật Dự Kiến

| # | Thách thức                                    | Giải pháp dự kiến                                                                           |
| - | :-------------------------------------------- | :------------------------------------------------------------------------------------------ |
| 1 | **Chọn loại wavelet phù hợp**                | Mặc định dùng `haar` (đơn giản, phổ biến). Phần nâng cao có thể thử `db2`, `sym2`, `coif1` |
| 2 | **Kích thước hash khác nhau**                 | Chuẩn hóa tất cả ảnh về cùng kích thước (`256x256`) trước khi DWT                          |
| 3 | **Chọn ngưỡng Hamming**                       | Dùng ROC Curve để chọn ngưỡng tối ưu (Youden's index)                                      |
| 4 | **Wavelet trong JavaScript**                  | Implement Haar wavelet thủ công (không có thư viện pywt cho JS)                             |
| 5 | **Hiệu năng xử lý ảnh lớn trên browser**     | Resize ảnh về `256x256` trước khi xử lý wavelet trong JS                                   |

---

## 6. Hướng Dẫn Chạy & Kiểm Tra

### 6.1. Phần Notebook

```bash
# Cài đặt thư viện
pip install pywt opencv-python numpy matplotlib scikit-learn

# Mở notebook
cd notebooks
jupyter notebook lab4_wavelet_hashing.ipynb
```

### 6.2. Phần Web App

```bash
# Cài đặt dependencies
cd web
npm install

# Chạy dev server
npm run dev
# → Mở http://localhost:5173

# Build production
npm run build
```

---

## 7. Timeline Dự Kiến

| Ngày | Công việc                                    |
| :--- | :------------------------------------------- |
| 1    | Setup project + chuẩn bị dữ liệu ảnh        |
| 2    | Implement DWT + Hash + Hamming (Notebook)    |
| 3    | Đánh giá metrics + ROC Curve (Notebook)      |
| 4    | Setup Web App + Giao diện                    |
| 5    | Logic wavelet trong JS + Polish + Deploy     |

---

> 📌 **LƯU Ý:** Tài liệu này là "bản thiết kế" cho toàn bộ dự án. AI phải tuân theo thứ tự các giai đoạn khi triển khai. Nếu gặp vấn đề, cập nhật tình trạng trong bảng và thông báo cho người dùng.
