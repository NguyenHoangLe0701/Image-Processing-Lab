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
(Đang cập nhật...)
