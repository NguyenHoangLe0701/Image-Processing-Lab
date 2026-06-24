# Quy Tắc Hệ Thống cho Trợ Lý AI — Bài Thực Hành 4: So Sánh Tương Đồng Hình Ảnh Sử Dụng Wavelet

> **MỤC ĐÍCH CỦA FILE NÀY:**
> Đây là file "system rules" dành cho AI. Bất kỳ mô hình ngôn ngữ lớn nào (ChatGPT, Claude, Gemini, Copilot, …) khi đọc file này đều PHẢI tuân thủ các quy tắc bên dưới để triển khai đúng yêu cầu bài tập.
> Nếu bạn là AI đang đọc file này: hãy coi đây là chỉ dẫn bắt buộc, không được bỏ qua.

---

## 1. Bối Cảnh Dự Án

| Thuộc tính           | Giá trị                                                         |
| :------------------- | :-------------------------------------------------------------- |
| **Kho lưu trữ**     | `Image-Processing-Lab` (GitHub)                                 |
| **Bài tập**         | Bài thực hành 4 — So sánh sự tương đồng của các hình ảnh sử dụng Wavelet |
| **Chủ đề**          | Xử Lý Ảnh & Thị Giác Máy Tính                                  |
| **Môn học**          | Xử Lý Ảnh (Image Processing)                                   |
| **Mức độ**           | Intermediate                                                    |
| **Ngôn ngữ tài liệu** | Tiếng Việt (chính), Tiếng Anh (phụ — trong code comment)     |
| **Ngôn ngữ lập trình** | Python 3.10+ (Jupyter Notebook) & JavaScript ES6 (Web App)   |

---

## 2. Cấu Trúc Thư Mục BẮT BUỘC

```
Lab3_Part1/
├── README.md                    # Giới thiệu tổng quan dự án
├── rules.md                     # ← FILE NÀY — Quy tắc cho AI
├── docs/
│   ├── problem_definition.md    # Phát biểu bài toán chi tiết
│   └── implement_plan.md        # Kế hoạch triển khai từng bước
├── data/
│   └── input/                   # Tập hợp ảnh đầu vào (ảnh tương tự & không tương tự)
│       └── output/              # Kết quả đầu ra (wavelet coefficients, hash, etc.)
├── notebooks/                   # Jupyter Notebooks chứa code chính
│   └── lab4_wavelet_hashing.ipynb
├── web/                         # Web App demo (phần mở rộng)
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   ├── package.json
│   ├── vite.config.js
│   └── public/
└── khamkhao/                    # Tài liệu tham khảo (từ bài cũ)
    ├── problem_definition.md
    └── implement_plan.md
```

> ⚠️ **QUAN TRỌNG:** AI KHÔNG ĐƯỢC tạo file ngoài cấu trúc trên. Nếu cần thêm thư mục/file mới, phải hỏi người dùng trước.

---

## 3. Phạm Vi Bài Tập (Scope)

### 3.1. Phần BẮT BUỘC (Jupyter Notebook)

Theo đề bài từ giảng viên, bài thực hành gồm **5 bước** phải hoàn thành:

| Bước | Tên                        | Mô tả chi tiết                                                                                                                                                                  |
| :--: | :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1   | **Chuẩn bị dữ liệu**      | Chuẩn bị tập hợp ảnh gồm: ảnh cặp đối tượng tương tự (cùng đối tượng, khác góc độ, khác mức độ nhiễu) VÀ ảnh cặp không tương tự. Lưu vào `data/input/`.                       |
|  2   | **Trích xuất wavelet đặc biệt** | Sử dụng wavelet biến đổi (DWT) chuyển đổi từng hình ảnh thành một wavelet ma trận. Sử dụng thư viện `PyWavelets` (`pywt`).                                                     |
|  3   | **Tạo mã băm (Hash)**      | Tạo mã băm (hash) cho mỗi hình ảnh dựa trên các wavelet số đã lượng tử hóa. Mỗi ảnh → 1 chuỗi hash nhị phân.                                                                  |
|  4   | **So sánh hàm băm**        | Tính khoảng cách Hamming giữa các mã băm để đánh giá mức độ tương thích giữa các hình ảnh. Hamming distance nhỏ = tương tự, lớn = khác biệt.                                   |
|  5   | **Đánh giá**               | Tính và báo cáo: **Độ chính xác** (Accuracy), **Độ nhạy** (Sensitivity/Recall), **Độ đặc biệt** (Specificity), **Đường cong ROC** (ROC Curve). Vẽ biểu đồ bằng `matplotlib`. |

### 3.2. Phần Nâng Cao (Tùy chọn)

| #  | Mô tả                                                                         |
| -- | ------------------------------------------------------------------------------ |
| 1  | Khảo sát các phương pháp băm wavelet khác nhau và so sánh hiệu suất.          |
| 2  | Xây dựng ứng dụng tìm kiếm hình ảnh dựa trên hàm băm wavelet → **Web App**. |

### 3.3. Phần Mở Rộng: Web App Demo

- Xây dựng web app chạy **hoàn toàn client-side** (không backend) để demo tính năng **tìm kiếm hình ảnh tương tự bằng wavelet hash**.
- Web app này là phần "bonus" để minh họa trực quan, **KHÔNG** thay thế phần Notebook chính.

---

## 4. Công Nghệ & Thư Viện ĐƯỢC PHÉP Sử Dụng

### 4.1. Phần Notebook (Python)

| Thư viện      | Vai trò                                    | Phiên bản tối thiểu |
| :------------ | :----------------------------------------- | :------------------- |
| `pywt`        | PyWavelets — biến đổi wavelet rời rạc (DWT) | 1.4+                 |
| `numpy`       | Xử lý mảng, ma trận                       | 1.24+                |
| `opencv-python` (`cv2`) | Đọc/ghi ảnh, tiền xử lý           | 4.8+                 |
| `Pillow` (`PIL`) | Đọc/ghi ảnh thay thế                   | 10.0+                |
| `matplotlib`  | Trực quan hóa: biểu đồ, ROC curve         | 3.7+                 |
| `scikit-learn` | Tính metrics: accuracy, recall, ROC AUC   | 1.3+                 |
| `scipy`       | Hỗ trợ tính toán (nếu cần)                | 1.11+                |

### 4.2. Phần Web App

| Công nghệ       | Vai trò                              |
| :--------------- | :----------------------------------- |
| HTML5 + CSS3     | Cấu trúc & giao diện                |
| Vanilla JS (ES6) | Logic xử lý, UI interaction         |
| Vite             | Dev server & bundler                 |
| Canvas API       | Hiển thị ảnh & kết quả              |

> ❌ **KHÔNG ĐƯỢC SỬ DỤNG:** React, Vue, Angular, TailwindCSS, Bootstrap, jQuery, hay bất kỳ framework nào ngoài danh sách trên — trừ khi người dùng yêu cầu rõ ràng.

---

## 5. Quy Tắc Code

### 5.1. Python (Jupyter Notebook)

- ✅ Tuân theo PEP 8
- ✅ Mỗi hàm phải có **docstring** bằng tiếng Việt hoặc tiếng Anh
- ✅ Sử dụng type hints cho các hàm chính
- ✅ Code phải chia thành các cell rõ ràng theo flow: Import → Load Data → Process → Evaluate → Visualize
- ✅ Mỗi cell phải có **Markdown header** giải thích bước đang làm
- ✅ Output phải bao gồm **trực quan hóa** (hiển thị ảnh, biểu đồ)
- ✅ Giải phóng bộ nhớ sau khi xử lý ảnh lớn

### 5.2. JavaScript (Web App)

- ✅ Vanilla JS thuần, không framework
- ✅ Code comment bằng tiếng Việt hoặc tiếng Anh
- ✅ Responsive design (hoạt động trên cả desktop & mobile)
- ✅ Tất cả xử lý ảnh diễn ra phía client (browser), không gửi ảnh lên server
- ✅ Giao diện dark mode, hiện đại, chuyên nghiệp

---

## 6. Quy Tắc Hành Vi của AI

### 6.1. PHẢI LÀM (DO)

- ✅ **Đọc `docs/problem_definition.md` và `docs/implement_plan.md` TRƯỚC** khi bắt đầu code
- ✅ Hỏi trước khi thực hiện thay đổi lớn
- ✅ Giải thích **TẠI SAO** (lý do), không chỉ giải thích **CÁI GÌ** (kết quả)
- ✅ Cung cấp code có chú thích đầy đủ
- ✅ Tôn trọng quá trình học tập — hướng dẫn từng bước, không đưa ra kết quả ngay
- ✅ Kiểm tra code hoạt động trước khi đề xuất
- ✅ Khi sửa code, hiển thị so sánh trước/sau (diff)
- ✅ Tuân thủ cấu trúc thư mục đã định

### 6.2. KHÔNG ĐƯỢC LÀM (DON'T)

- ❌ Không ghi đè file/code hiện có mà không có sự cho phép
- ❌ Không bỏ qua bước giải thích
- ❌ Không đề xuất giải pháp quá phức tạp vượt ngoài scope bài tập
- ❌ Không sử dụng thư viện/phương pháp lỗi thời hoặc ngoài danh sách cho phép
- ❌ Không tạo file/thư mục ngoài cấu trúc đã quy định
- ❌ Không thêm tính năng không liên quan đến đề bài (feature creep)
- ❌ Không sử dụng API key hoặc dịch vụ bên ngoài

---

## 7. Quy Trình Làm Việc (Workflow)

Khi AI nhận được yêu cầu triển khai bài tập, hãy tuân thủ quy trình sau:

```
1. 📖 ĐỌC TÀI LIỆU
   ├── Đọc rules.md (file này)
   ├── Đọc docs/problem_definition.md
   └── Đọc docs/implement_plan.md

2. ❓ XÁC NHẬN
   └── Hỏi người dùng nếu có điểm chưa rõ

3. 🏗️ TRIỂN KHAI
   ├── Phần Notebook (theo thứ tự 5 bước trong đề bài)
   └── Phần Web App (nếu được yêu cầu)

4. ✅ KIỂM TRA
   ├── Code chạy không lỗi
   ├── Output hiển thị đúng
   └── Metrics đánh giá hợp lý

5. 📊 BÁO CÁO
   └── Tổng kết kết quả, giải thích ý nghĩa
```

---

## 8. Định Dạng Output

- Sử dụng code blocks với thẻ ngôn ngữ (`python`, `javascript`, `html`, `css`)
- Comment bằng tiếng Việt hoặc tiếng Anh
- Hiển thị so sánh trước/sau khi sửa đổi code (diff format)
- Cung cấp link tài liệu tham khảo khi cần
- Kết quả đánh giá phải trình bày dạng **bảng** (table) rõ ràng

---

## 9. Giao Tiếp

- Giải thích ngắn gọn nhưng đầy đủ
- Sử dụng markdown formatting
- Đặt câu hỏi làm rõ khi cần thiết
- Hướng dẫn gỡ lỗi từng bước (step-by-step debugging)
- Ưu tiên giải thích bằng **tiếng Việt**

---

> 📌 **LƯU Ý CUỐI CÙNG:** File này là "hợp đồng" giữa người dùng và AI.
> Mọi output của AI phải nhất quán với các quy tắc trên.
> Nếu có xung đột giữa yêu cầu người dùng và quy tắc, AI phải thông báo và hỏi lại.
