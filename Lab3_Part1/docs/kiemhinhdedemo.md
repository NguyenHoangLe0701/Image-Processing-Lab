# 📸 Hướng Dẫn Chuẩn Bị Hình Ảnh Demo Lab 4 (Wavelet Hashing)

Để buổi demo ngày mai diễn ra hoàn hảo, mượt mà và biểu đồ đánh giá ra kết quả đẹp mắt nhất, dưới đây là chi tiết số lượng và cách thức chuẩn bị dữ liệu hình ảnh.

> [!IMPORTANT]
> Phải đảm bảo ảnh được lưu đúng vào 2 thư mục sau:
> - `d:/Workspace/Xử Lý Ảnh/Lab3_Part1/data/input/similar/`
> - `d:/Workspace/Xử Lý Ảnh/Lab3_Part1/data/input/dissimilar/`
> Nếu không đủ tối thiểu 2 ảnh mỗi thư mục, code sẽ báo lỗi `FileNotFoundError` và dừng lại.

---

## 1. Số Lượng Tối Thiểu Bắt Buộc
- **Thư mục `similar`:** Ít nhất **2 ảnh**
- **Thư mục `dissimilar`:** Ít nhất **2 ảnh**

---

## 2. Số Lượng Khuyến Nghị (Để Kết Quả Đẹp Nhất)
Nên chuẩn bị **Tổng cộng khoảng 10 đến 15 ảnh**, chia đều làm 2 nhóm:

### 👉 Nhóm 1: Thư mục `similar` (Khoảng 5 - 8 ảnh)
Nhóm ảnh này dùng để kiểm tra khả năng nhận diện các bức ảnh "là anh em một nhà" (các biến thể của cùng một đối tượng) của thuật toán Wavelet Hashing.

**Cách chuẩn bị:**
Hãy chọn 1 (hoặc 2) vật thể cố định. Ví dụ: Chụp một cái ly nước trên bàn.
1. **Ảnh 1 (Ảnh gốc):** Căn góc chuẩn, ánh sáng đẹp.
2. **Ảnh 2 (Thay đổi góc):** Xoay cái ly đi một chút.
3. **Ảnh 3 (Scale/Crop):** Để camera sát lại gần để cái ly to hơn.
4. **Ảnh 4 (Ánh sáng):** Kéo rèm lại cho phòng tối bớt hoặc chỉnh độ sáng thấp xuống.
5. **Ảnh 5 (Thêm nhiễu/Blur):** Thêm một chút filter mờ hoặc nhiễu hạt.
*(Góp tất cả 5-8 tấm biến thể này bỏ chung vào thư mục `similar`)*.

### 👉 Nhóm 2: Thư mục `dissimilar` (Khoảng 5 - 8 ảnh)
Nhóm ảnh này dùng để kiểm tra khả năng phân biệt sự khác nhau, đảm bảo thuật toán không nhận nhầm "người dưng" thành người quen.

**Cách chuẩn bị:**
Hãy tải hoặc chụp 5 đến 8 bức ảnh **hoàn toàn khác biệt nhau về nội dung**.
- Ví dụ: Ảnh con mèo, ảnh phong cảnh biển, ảnh chiếc xe máy, ảnh cuốn sách, ảnh bông hoa...
*(Tất cả 5-8 tấm hoàn toàn không liên quan này bỏ chung vào thư mục `dissimilar`)*.

---

## 💡 Lưu Ý Khi Trình Bày
Khi bắt đầu demo, bạn hãy nhấn mạnh với người xem:
> *"Em đã chủ động tắt tính năng sinh ảnh giả của bài Lab gốc để đưa dữ liệu ảnh thực tế vào. Việc này giúp đánh giá độ chính xác và hiệu quả thực sự của thuật toán Wavelet Hashing trên dữ liệu thật!"*

Chúc bạn có một buổi demo thành công rực rỡ! 🎉
