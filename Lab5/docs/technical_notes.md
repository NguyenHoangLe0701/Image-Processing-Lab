# Ghi chú Kỹ thuật (Technical Notes) — Siamese Network & Photo Matching

Tài liệu này giải thích một số hiện tượng và đặc điểm kỹ thuật quan trọng trong quá trình huấn luyện và triển khai hệ thống **NeuraMatch Studio** sử dụng Siamese Network.

---

## 1. Tại sao dùng Siamese Network thay vì Phân loại (Classification) thông thường?

Nếu mục tiêu là nhận diện ảnh, tại sao không dùng một mạng CNN phân loại thông thường (như bài toán chó/mèo)?

**Trả lời:** Vì bài toán Photo Matching thuộc dạng *One-Shot Learning* (hoặc Zero-Shot).
- Trong phân loại thông thường: Mô hình cần được huấn luyện trước trên tất cả các lớp (classes). Nếu hệ thống muốn nhận diện một người mới, bạn phải thu thập hàng ngàn bức ảnh của người đó, thêm một node vào lớp output, và retrain lại toàn bộ mạng.
- Với Siamese Network: Thay vì học cách "Phân loại", mô hình học cách **"Phân biệt"** (Differentiate) hoặc học một **"Hàm khoảng cách"** (Similarity Metric). Mô hình được huấn luyện để hiểu "Thế nào là sự giống nhau?".
- Nhờ đó, khi đưa một cặp ảnh của người/vật *chưa từng xuất hiện trong tập huấn luyện*, mô hình vẫn có thể tính khoảng cách và biết được chúng có giống nhau hay không. Đây là nền tảng của các hệ thống Face ID.

---

## 2. Ý nghĩa của không gian nhúng (Embedding Space) 128 chiều

Kiến trúc mô hình có lớp output là một vector 128 chiều (128-dim).

### Tại sao lại là 128?
- Kích thước này đủ lớn để mã hóa các đặc trưng phức tạp của hình ảnh (màu sắc, góc cạnh, cấu trúc ngữ nghĩa).
- Đủ nhỏ để tránh Curse of Dimensionality (Lời nguyền số chiều) và tối ưu hóa thời gian tính toán Euclidean distance. FaceNet (Google) cũng phổ biến việc sử dụng vector nhúng 128 chiều.

### Embedding Space hoạt động thế nào?
Thử tưởng tượng không gian 3 chiều (Oxyz) nơi các bức ảnh là các điểm tọa độ.
Siamese Network sử dụng Contrastive Loss để bóp méo và định hình không gian 128 chiều này sao cho:
1. Các bức ảnh của cùng một người/vật bị lực hấp dẫn "kéo" lại sát nhau thành một cụm (cluster).
2. Các bức ảnh của những người/vật khác nhau bị lực đẩy "đẩy" văng ra xa nhau.

Khoảng cách (Euclidean distance) chính là chiều dài đường thẳng nối 2 điểm tọa độ trong không gian 128 chiều này.

---

## 3. Contrastive Loss & Ý nghĩa của `margin`

Hàm mất mát Contrastive Loss có công thức:
`L = (1 − Y) × ½ × D² + Y × ½ × max(0, margin − D)²`

### Khi nhãn `Y = 0` (Ảnh giống nhau)
- Nửa sau của công thức bị triệt tiêu (nhân với 0).
- Mô hình chỉ tối thiểu hóa `½ × D²`. Nó sẽ liên tục ép trọng số CNN sao cho khoảng cách `D` tiến dần về 0.

### Khi nhãn `Y = 1` (Ảnh khác nhau)
- Nửa trước bị triệt tiêu.
- Mô hình phải tối thiểu hóa `½ × max(0, margin - D)²`.
- **Vai trò của `margin`:** Nếu mô hình đã đẩy 2 ảnh ra xa nhau với khoảng cách `D > margin` (VD: margin = 1.0, mà D = 1.2), hàm loss sẽ trả về `0`. Nghĩa là mô hình được "thưởng" và không bị cập nhật trọng số nữa. 
- Tại sao cần margin? Nếu không có margin, mô hình sẽ liên tục phung phí tài nguyên để đẩy các ảnh khác nhau ra xa đến "vô cực", làm hỏng không gian embedding của các cụm (clusters) khác.

---

## 4. Hiện tượng: Khó đạt khoảng cách tuyệt đối `0.0000`

Khi upload 2 bức ảnh giống y hệt nhau lên NeuraMatch Studio, khoảng cách thường xấp xỉ `0.0xxx` chứ hiếm khi bằng đúng `0.0000`.

- **Nguyên nhân 1 - Image Compression:** Khi dùng HTML Canvas để parse ảnh sang Base64 trên web, ảnh bị giải nén và nén lại thành JPEG hoặc bị thay đổi hệ màu. Sự xê dịch pixel siêu nhỏ này khi đi qua hàng chục lớp Convolution của ResNet18 sẽ bị khuếch đại lên một chút.
- **Nguyên nhân 2 - Dropout & Batch Normalization:** Tuy ở phase Inference (`model.eval()`), các lớp này bị đóng băng, nhưng các phép toán dấu phẩy động (float32) trên GPU/CPU vẫn sinh ra sai số (floating-point precision error) ở mức phần ngàn.

**Kết luận:** Đừng set threshold so sánh ở mức quá khắt khe. Một ngưỡng `threshold = 0.5` hoặc `1.0` (tùy thuộc vào margin lúc train) là con số lý tưởng để dung sai cho nhiễu hệ thống.

---

## 5. Vấn đề "Cold Start" khi triển khai trên Serverless/Render

- Backend Flask + PyTorch khá nặng (image size Docker có thể lên tới 2-3GB).
- Khi deploy trên dịch vụ Free Tier của Render, nếu API không nhận request nào trong 15 phút, server sẽ tự động ngủ (Sleep/Spindown).
- Do đó, request đầu tiên đánh thức server (Cold Start) sẽ mất từ **30 giây đến 1 phút** để load PyTorch và load trọng số mô hình `siamese_model.pth` (100MB+) vào RAM.
- **Giải pháp Frontend:** Nút "So Sánh" trên web cần có biểu tượng Loading (`spinner`) rõ ràng và disable nút này đi để người dùng không bấm liên tục nhiều lần trong lúc chờ Cold Start.
