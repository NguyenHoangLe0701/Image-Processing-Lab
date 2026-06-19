# Ghi chú Kỹ thuật (Technical Notes)

Tài liệu này giải thích một số hiện tượng và đặc điểm kỹ thuật thú vị trong quá trình xây dựng hệ thống **Wavelet Studio** (Perceptual Hashing & Wavelet Transform).

---

## 1. Tại sao 2 ảnh gốc giống hệt nhau hiếm khi đạt 100% độ tương đồng?

Trong quá trình sử dụng hệ thống, bạn có thể nhận thấy khi upload một tấm ảnh giống y hệt một tấm ảnh đang có sẵn trong Database, điểm số tương đồng thường chỉ đạt mức **94% - 99%** thay vì tuyệt đối 100%.

Điều này không phải do thuật toán bị lỗi, mà là do đặc trưng của việc xử lý ảnh trên nền tảng Web:

### a) Quá trình nén ẩn của Trình duyệt (Canvas Compression)
Khi người dùng tải một bức ảnh lên thông qua giao diện Web, để tiện cho việc xử lý và tối ưu tốc độ truyền tải, mã nguồn Frontend (JavaScript) đã:
1. Vẽ bức ảnh đó lên một thẻ `<canvas>` ẩn.
2. Trích xuất lại dữ liệu ảnh dưới định dạng chuỗi Base64 (`image/jpeg`).

Quá trình xuất ảnh JPEG từ Canvas là quá trình **nén mất mát dữ liệu (Lossy Compression)**. Dù mắt thường không nhận ra, nhưng các điểm ảnh (pixel) đã bị xê dịch và làm tròn lại.

### b) Nhiễu tần số và Lượng tử hóa mã băm (Binarization)
Hệ thống sử dụng ma trận xấp xỉ `cA` (Approximation) của biến đổi Wavelet (DWT) để lấy đặc trưng. Mặc dù `cA` kháng nhiễu rất tốt, nhưng khi chúng ta binarize (nhị phân hóa) ma trận này bằng Trị số giữa (Median):
- Những pixel có giá trị nằm sát vách với mốc Median rất dễ bị "lật" từ `0` sang `1` (hoặc ngược lại) chỉ vì sự xê dịch siêu nhỏ do chuẩn nén JPEG ở bước trên gây ra.
- Với mảng băm độ phân giải cao (ví dụ: 16x16 = 256 bits), chỉ cần 3-5 bit bị lật là tỷ lệ phần trăm đã không còn giữ được mốc 100%.

### 👉 Kết luận
Việc sai số nhỏ này là đặc tính kinh điển của các hệ thống **Perceptual Hashing**. Điểm mạnh của Perceptual Hashing không phải là tìm ra ảnh giống nhau 100% ở cấp độ Byte (như mã băm MD5 hay SHA-256), mà là tìm ra sự tương đồng về mặt thị giác.

Đó là lý do vì sao trong hệ thống của chúng ta:
- Ngưỡng **`> 80%`** đã được tính toán và chuẩn hóa là mức **Khớp hoàn toàn (Bản sao)**. Nó đủ độ bao dung để chấp nhận các sai lệch do nén ảnh, resize, hay cắt xén nhẹ.

---

## 2. Vì sao DWT Level 4 (256 bits) lại ưu việt hơn?
Trong hệ thống Wavelet Studio, với kích thước ảnh đầu vào được chuẩn hóa là **256x256 pixels**, biến đổi Wavelet được cấu hình chạy phân rã ở **Level 4** (DWT_LEVEL = 4). Điều này đồng nghĩa với việc các ma trận hệ số thu được ở lớp cuối cùng (cA, cH, cV, cD) sẽ có kích thước là **16x16 pixels** (tương đương 256 bits cho mỗi sub-band, và 1024 bits tổng cộng cho toàn bộ mã băm).

Sự lựa chọn này không phải là ngẫu nhiên, mà mang lại sự cân bằng tối ưu về 3 mặt:

### a) Điểm rơi hoàn hảo giữa "Bao quát" và "Chi tiết"
Mỗi lần phân rã Wavelet (tăng 1 Level), bức ảnh được giảm một nửa kích thước và các chi tiết nhỏ (nhiễu, nếp nhăn, lá cây nhỏ) sẽ bị lọc bỏ vào các sub-band chi tiết.
- Nếu dừng lại ở **Level 2 hoặc 3 (64x64 hoặc 32x32)**: Mã băm còn chứa quá nhiều chi tiết vụn vặt. Nếu ảnh gốc bị làm mờ, bị nén hoặc đóng logo nhỏ, các chi tiết này sẽ làm thay đổi lượng lớn bit, khiến thuật toán đánh giá ảnh "KHÔNG GIỐNG NHAU" (tính bao dung kém).
- Tại **Level 4 (16x16)**: Bức ảnh đã được cô đọng lại thành những mảng hình khối cốt lõi (ví dụ: đâu là trời, đâu là đất, đâu là khối nhà). Sự xê dịch pixel, mờ ảnh, nhiễu hạt gần như không tác động đến hình thái 16x16 này. Nhờ đó, tính kháng nhiễu (Robustness) đạt mức cao nhất.

### b) Loại trừ hiện tượng "Chỉ tay vào hươu bảo ngựa" (False Positive)
Vậy tại sao không phân rã tiếp xuống **Level 5 (8x8 = 64 bits)** hay sâu hơn để tăng tính kháng nhiễu?
- Ở kích thước 8x8, thông tin hình ảnh bị bào mòn quá mức. Hai bức hình phong cảnh hoàn toàn khác nhau (nhưng cùng có bầu trời ở trên, mặt đất ở dưới) có thể sẽ cho ra ma trận 8x8 y hệt nhau.
- Level 4 (16x16 = 256 bits cho mỗi đặc trưng) cung cấp đủ độ phân giải không gian (Spatial Resolution) để có thể phân biệt rõ ràng hai bức ảnh tuy có chung bố cục nhưng khác biệt về đối tượng.

### c) Tối ưu hóa hiệu năng tính toán (Performance)
Khi xây dựng tính năng "Image Search" – quét một ảnh mới so với hàng ngàn ảnh trong Cơ sở dữ liệu:
- Mảng băm 1024 bits (tổng hợp từ 4 sub-bands 256 bits) là một độ dài lý tưởng. Quá trình tính **Khoảng cách Hamming** trên mảng 1024 phần tử diễn ra chỉ trong chớp mắt (tính bằng milli-giây).
- Nếu dùng Level thấp hơn (ví dụ Level 2), mã băm sẽ dài hơn 16.000 bits. Quá trình tính toán với CSDL khổng lồ sẽ gây nghẽn cổ chai và độ trễ phản hồi không đáp ứng được tính thời gian thực của ứng dụng Web.
