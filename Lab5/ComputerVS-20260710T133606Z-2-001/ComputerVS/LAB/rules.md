# Quy Tắc Hệ Thống cho Trợ Lý AI — Nhận diện khuôn mặt thời gian thực với FaceNet & MTCNN trên Webcam

> **MỤC ĐÍCH CỦA FILE NÀY:**
> Đây là file "system rules" dành cho AI. Bất kỳ mô hình ngôn ngữ lớn nào (ChatGPT, Claude, Gemini, Copilot, …) khi đọc file này đều PHẢI tuân thủ các quy tắc bên dưới để triển khai đúng yêu cầu bài tập.
> Nếu bạn là AI đang đọc file này: hãy coi đây là chỉ dẫn bắt buộc, không được bỏ qua.

---

## 1. Bối Cảnh Dự Án

| Thuộc tính           | Giá trị                                                         |
| :------------------- | :-------------------------------------------------------------- |
| **Kho lưu trữ**     | `Image-Processing-Lab` (GitHub)                                 |
| **Bài tập**         | Nhận diện khuôn mặt thời gian thực với FaceNet & MTCNN trên Webcam |
| **Chủ đề**          | Xử Lý Ảnh & Thị Giác Máy Tính                                  |
| **Môn học**          | Xử Lý Ảnh (Image Processing)                                   |
| **Mức độ**           | Intermediate                                                    |
| **Ngôn ngữ tài liệu** | Tiếng Việt (chính), Tiếng Anh (phụ — trong code comment)     |
| **Ngôn ngữ lập trình** | Python 3.10+ (Jupyter Notebook)    |

---

## 2. Cấu Trúc Thư Mục BẮT BUỘC

```
Image-Processing-Lab/
│
├── README.md
├── requirements.txt
│
├── notebooks/
│   └── Lab5_FaceNet_MTCNN_Webcam.ipynb
│
├── src/
│   ├── __init__.py
│   │
│   ├── camera.py
│   ├── detector.py
│   ├── embedding.py
│   ├── recognizer.py
│   ├── database.py
│   ├── utils.py
│   └── config.py
│
├── models/
│   ├── facenet/
│   │   └── facenet_keras.h5
│   │
│   └── mtcnn/
│       └── (nếu cần thêm model)
│
├── dataset/
│   │
│   ├── raw/
│   │   ├── person_01/
│   │   ├── person_02/
│   │   └── ...
│   │
│   ├── aligned/
│   │   ├── person_01/
│   │   ├── person_02/
│   │   └── ...
│   │
│   └── embeddings/
│       ├── embeddings.npy
│       └── labels.npy
│
├── outputs/
│   ├── screenshots/
│   ├── logs/
│   └── videos/
│
├── docs/
│   ├── report.md
│   ├── report.pdf
│   └── images/
│
└── assets/
    ├── demo.gif
    ├── architecture.png
    └── workflow.png
```

> ⚠️ **QUAN TRỌNG:** AI KHÔNG ĐƯỢC tạo file ngoài cấu trúc trên. Nếu cần thêm thư mục/file mới, phải hỏi người dùng trước.

---

## 3. Phạm Vi Bài Tập (Scope)

### 3.1. Phần BẮT BUỘC (Jupyter Notebook)

Quy trình Nhận diện Khuôn mặt Thời gian thực (Real-time Face Recognition)

Dưới đây là bảng tổng hợp các bước thực hiện hệ thống nhận diện khuôn mặt sử dụng MTCNN và FaceNet:

| Bước | Tên | Mô tả |
| :---: | :--- | :--- |
| **1** | Chuẩn bị môi trường | Cài đặt các thư viện cần thiết (OpenCV, TensorFlow, MTCNN, FaceNet, NumPy, Matplotlib...) và kiểm tra môi trường Python. |
| **2** | Import thư viện | Import toàn bộ thư viện phục vụ xử lý ảnh, deep learning và hiển thị kết quả. |
| **3** | Khởi tạo Webcam | Truy cập webcam bằng OpenCV (`cv2.VideoCapture`) và kiểm tra khả năng đọc từng khung hình (frame). |
| **4** | Khởi tạo MTCNN | Tạo đối tượng MTCNN để phát hiện khuôn mặt trên từng frame từ webcam. |
| **5** | Phát hiện khuôn mặt | Xác định vị trí khuôn mặt (Bounding Box), điểm đặc trưng (Landmarks) và độ tin cậy (Confidence Score). |
| **6** | Cắt và chuẩn hóa dữ liệu (Dataset) | Thu thập ảnh khuôn mặt từ webcam, crop theo Bounding Box và resize về một kích thước đồng nhất (ví dụ: 64x64 hoặc 96x96 để mô hình tự build train nhanh hơn). |
| **7** | Xây dựng tập dữ liệu (Training Set) | Tổ chức tập ảnh đã thu thập thành các thư mục theo tên người. Áp dụng kỹ thuật phân chia Train/Validation và gán nhãn (One-hot encoding). |
| **8** | Xây dựng kiến trúc CNN | Sử dụng Keras Sequential hoặc Functional API để tự thiết kế các lớp (Layers) cho mạng nơ-ron: Conv2D, MaxPooling2D, Flatten, Dense, Dropout. |
| **9** | Huấn luyện & Đánh giá (Training) | Cấu hình hàm loss (Categorical Crossentropy), Optimizer (Adam) và tiến hành huấn luyện (model.fit). Sau khi train, xuất các biểu đồ đo lường hiệu suất, phân tích ma trận nhầm lẫn (Confusion Matrix) và F1-score để đánh giá khả năng phân loại. |
| **10** | Lưu mô hình | Lưu cấu trúc và các trọng số (weights) đã huấn luyện thành một file của riêng bạn (ví dụ: models/custom_face_cnn.h5). |
| **11** | Dự đoán thời gian thực (Inference) | Trong vòng lặp webcam, đưa khuôn mặt (đã crop & chuẩn hóa) qua mô hình tự train để lấy xác suất dự đoán (model.predict). |
| **12** | Nhận diện người dùng | Lấy nhãn có xác suất cao nhất (Argmax). Nếu xác suất này thấp hơn ngưỡng Threshold (ví dụ < 70%), hiển thị Unknown. Ngược lại, hiển thị tên người được dự đoán. |
| **13** | Hiển thị kết quả | Vẽ Bounding Box, tên người và độ tin cậy trực tiếp lên khung hình webcam. |
| **14** | Giải phóng tài nguyên | Đóng webcam và hủy toàn bộ cửa sổ OpenCV sau khi kết thúc chương trình. |

### 3.2 Các Tính năng Mở rộng / Nâng cao

| Tên tính năng | Mô tả |
| :--- | :--- |
| **Giao diện người dùng (GUI)** | Xây dựng giao diện bằng Tkinter hoặc PyQt để thao tác trực quan hơn. |
| **Hỗ trợ nhiều Camera** | Cho phép lựa chọn Camera ID (0, 1, 2, ...) khi hệ thống có nhiều webcam. |
| **Đánh giá hiệu năng** | Đo thời gian xử lý của từng bước (MTCNN, FaceNet, nhận diện) để tối ưu tốc độ. |
| **Ghi video kết quả** | Lưu video quá trình nhận diện từ webcam để phục vụ báo cáo hoặc trình diễn. |
---

## 4. Công Nghệ & Thư Viện ĐƯỢC PHÉP Sử Dụng

### 4.1. Công nghệ chính
Bài thực hành sử dụng các công nghệ phổ biến trong lĩnh vực Computer Vision và Deep Learning để xây dựng hệ thống nhận diện khuôn mặt theo thời gian thực.

| Công nghệ | Phiên bản khuyến nghị | Mục đích sử dụng |
| :--- | :---: | :--- |
| **Python** | 3.10+ | Ngôn ngữ lập trình chính của bài Lab |
| **Jupyter Notebook** | Mới nhất | Thực hiện và trình bày toàn bộ bài Lab |
| **OpenCV** | 4.x | Đọc webcam, xử lý ảnh và hiển thị kết quả |
| **TensorFlow** | 2.x | Chạy mô hình FaceNet |
| **Keras** | Tích hợp TensorFlow | Tải và suy luận mô hình Deep Learning |
| **MTCNN** | Mới nhất | Phát hiện khuôn mặt trên ảnh |
| **FaceNet** | Pre-trained Model | Trích xuất đặc trưng (Embedding) của khuôn mặt |
| **NumPy** | Mới nhất | Tính toán ma trận và xử lý dữ liệu số |
| **Matplotlib** | Mới nhất | Hiển thị và trực quan hóa hình ảnh (nếu cần) |

### 4.2. Thư viện Python được phép sử dụng
Các thư viện dưới đây được phép sử dụng trong bài Lab.

| Thư viện | Vai trò |
| :--- | :--- |
| `opencv-python` | Truy cập webcam, đọc và hiển thị hình ảnh |
| `numpy` | Xử lý mảng và tính toán số học |
| `tensorflow` | Chạy mô hình FaceNet |
| `keras` | Load mô hình `.h5` và suy luận |
| `mtcnn` | Phát hiện khuôn mặt |
| `matplotlib` | Hiển thị ảnh trong Notebook |
| `Pillow (PIL)` | Đọc và xử lý ảnh |
| `os` | Quản lý thư mục và tập tin |
| `glob` | Tìm kiếm ảnh trong Dataset |
| `time` | Đo thời gian và tính FPS |
| `pickle` *(tùy chọn)* | Lưu và tải Embedding |
| `scikit-learn` *(tùy chọn)* | Hỗ trợ tính khoảng cách hoặc đánh giá mô hình |

---

## 5. Quy Tắc Code

| Quy tắc | Mô tả |
| :--- | :--- |
| **Tuân thủ chuẩn PEP 8** | Mã nguồn cần tuân theo quy tắc đặt tên, thụt lề (4 spaces), khoảng trắng và độ dài dòng theo chuẩn PEP 8 của Python. |
| **Mỗi hàm phải có Docstring** | Tất cả các hàm tự định nghĩa phải có Docstring (tiếng Việt hoặc tiếng Anh) mô tả chức năng, tham số đầu vào và giá trị trả về. |
| **Sử dụng Type Hints** | Các hàm chính nên khai báo kiểu dữ liệu cho tham số và giá trị trả về nhằm tăng tính rõ ràng và hỗ trợ IDE. |
| **Notebook phải có cấu trúc rõ ràng** | Code được chia thành các Cell theo luồng xử lý: Import → Configuration → Load Data → Preprocessing → Model Initialization → Processing → Evaluation → Visualization → Cleanup
| **Mỗi Cell phải có Markdown Header** | Trước mỗi Cell Code cần có một Cell Markdown mô tả mục tiêu và nội dung của bước đang thực hiện. |
| **Trực quan hóa kết quả** | Các bước quan trọng phải có hình ảnh hoặc biểu đồ minh họa (ví dụ: ảnh gốc, ảnh sau khi phát hiện khuôn mặt, Bounding Box, Embedding Distance, FPS nếu có). |
| **Giải phóng tài nguyên** | Sau khi xử lý xong cần giải phóng webcam (`release()`), đóng cửa sổ OpenCV (`destroyAllWindows()`), và xóa các biến lớn nếu không còn sử dụng. |
| **Không Hard-code đường dẫn** | Các đường dẫn đến Dataset, Model và Output nên được khai báo dưới dạng hằng số hoặc trong phần cấu hình để dễ thay đổi. |
| **Có xử lý ngoại lệ** | Các thao tác như đọc ảnh, mở webcam hoặc tải model nên được kiểm tra lỗi bằng `try...except` hoặc điều kiện kiểm tra phù hợp. |
| **Tái sử dụng mã nguồn** | Những đoạn mã được sử dụng nhiều lần nên được đóng gói thành hàm thay vì sao chép lặp lại. |
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

- Sử dụng code blocks với thẻ ngôn ngữ (`python`)
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
