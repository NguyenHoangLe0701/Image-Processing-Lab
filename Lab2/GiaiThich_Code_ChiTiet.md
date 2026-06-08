# TÀI LIỆU VẤN ĐÁP: GIẢI THÍCH CHI TIẾT CODE (WHY & WHAT IF)

Tài liệu này được biên soạn để hỗ trợ bạn bảo vệ môn học (vấn đáp). Nội dung sẽ xoáy sâu vào việc **tại sao lại dùng hàm này, tham số này**, và **điều gì xảy ra nếu thay đổi các con số đó**. Đây là cách các thầy cô thường dùng để hỏi kiểm tra tư duy lập trình của bạn.

---

## 1. TOÁN TỬ ĐIỂM ẢNH

### Cắt Nghĩa: `cv2.add(img, np.array([75.0]))`
* **Tại sao dùng `cv2.add` mà không dùng toán tử cộng `img + 75` của Python/Numpy?**
  - **Tư duy/Giải thích:** Kiểu dữ liệu của ảnh là `uint8` (chỉ chứa được từ 0 đến 255). Nếu bạn lấy một pixel đang có độ sáng 200 và dùng phép `+ 75`, kết quả ra 275. Bị tràn số (overflow)! Numpy sẽ xử lý bằng cách lấy $275 - 256 = 19$. Thế là một điểm đáng ra phải "trắng rực" thì lại biến thành "đen thui".
  - **Giải pháp:** `cv2.add()` có cơ chế *saturate cast* (cắt gọt bão hòa). Bất kỳ con số nào cộng lại vượt quá 255 đều bị chốt cứng ở mức 255. 

### Cắt Nghĩa: `cv2.convertScaleAbs(img, alpha=1.5, beta=0)`
* **Tại sao dùng hàm này cho độ tương phản? Các số này nghĩa là gì?**
  - Công thức lõi: $New Pixel = (Old Pixel * \alpha) + \beta$.
  - **Số `alpha = 1.5`:** Hệ số tương phản. 
    - *Nếu đổi thành số khác?* Nếu `alpha = 1.0`, ảnh giữ nguyên. Nếu `alpha < 1` (ví dụ 0.5), độ lệch giữa các màu sẽ bị thu hẹp lại, bức ảnh sẽ xám xịt, mờ căm (giảm tương phản). Nếu `alpha > 1`, sự chênh lệch màu được giãn ra, ảnh sắc nét, sặc sỡ hơn.
  - **Số `beta = 0`:** Độ sáng cộng thêm. Ở đây chỉ muốn test tương phản nên ta không cộng thêm độ sáng (`beta=0`).

### Cắt Nghĩa: `cv2.threshold(img_gray, 127, 255, cv2.THRESH_BINARY)`
* **Tại sao lại có 2 con số 127 và 255 ở đây? Nếu đổi thì sao?**
  - **Số `127`:** Là ngưỡng (Threshold). Điểm ảnh nào sáng hơn 127 sẽ biến thành trắng, tối hơn 127 biến thành đen.
    - *Nếu đổi thành 50?* Chỉ những điểm rất tối (0-50) mới thành đen, còn lại phần lớn ảnh (51-255) sẽ thành màu trắng. Bức ảnh sẽ ngập tràn màu trắng.
    - *Nếu đổi thành 200?* Bức ảnh sẽ chủ yếu là màu đen, chỉ những điểm sáng rực mới được chuyển thành trắng.
  - **Số `255`:** Giá trị gán cho các điểm ảnh thỏa mãn điều kiện vượt qua ngưỡng. (Biến thành màu trắng tinh = 255). Có thể đổi thành số khác (như 200) nếu bạn muốn vùng chọn có màu xám nhạt thay vì trắng tinh.

---

## 2. LỌC TUYẾN TÍNH (LÀM MỜ VÀ SẮC NÉT)

### Cắt Nghĩa: `cv2.blur(img, (5, 5))` và `cv2.GaussianBlur(img, (5, 5), 0)`
* **`(5, 5)` là gì? Tại sao phải luôn là số lẻ?**
  - `(5, 5)` là kích thước Kernel (cửa sổ trượt). Nó quét 1 vùng 5x5 pixel và lấy trung bình.
  - **Tại sao số lẻ (3, 5, 7)?** Vì cửa sổ cần 1 điểm "Tâm" tuyệt đối để gán kết quả thay thế vào điểm đó. Ma trận lẻ (ví dụ 3x3) luôn có điểm ở chính giữa (tọa độ 1,1). Nếu bạn cố tình đưa số chẵn `(4, 4)` vào, chương trình sẽ báo lỗi vì không xác định được tâm đối xứng.
* **Điều gì xảy ra nếu thay đổi từ `(5, 5)` lên `(31, 31)`?**
  - Cửa sổ càng to, nó tính trung bình càng rộng. Bức ảnh sẽ cực kỳ nhòe và mất hết chi tiết nhỏ, chỉ còn thấy các mảng màu mờ mờ lớn.
* **Số `0` trong `GaussianBlur` là gì?**
  - Đây là tham số độ lệch chuẩn sigma theo trục X (`sigmaX`). Đặt là 0 để yêu cầu OpenCV tự động tính toán sigma dựa trên kích thước cửa sổ `(5, 5)`. 

### Cắt Nghĩa: Kernel làm sắc nét
```python
sharpen_kernel = np.array([
    [ 0, -1,  0],
    [-1,  5, -1],
    [ 0, -1,  0]
])
```
* **Tại sao các con số này được xếp như vậy?**
  - **Tâm `5`, viền xung quanh `-1`:** Nó mang ý nghĩa "Tăng cường sức ảnh hưởng của điểm ở giữa" và "trừ đi ảnh hưởng của các điểm lân cận". Điều này làm sự chênh lệch màu ở các đường viền trở nên gắt hơn -> Cảm giác mắt người thấy "sắc nét" hơn.
* **Bí mật của tổng các phần tử:**
  - $5 - 1 - 1 - 1 - 1 = 1$.
  - *Tại sao tổng phải bằng 1?* Nếu tổng các phần tử trong kernel = 1, độ sáng tổng thể (Global brightness) của toàn bức ảnh sẽ được giữ nguyên, không bị tối đi hay sáng quá mức.
  - *Nếu đổi số 5 thành số 10?* Tổng ma trận bằng 6. Cường độ của mọi điểm ảnh sẽ nhân lên gấp khoảng 6 lần, bức ảnh sẽ bị cháy sáng trắng xóa.

---

## 3. PHÁT HIỆN CẠNH (SOBEL / PREWITT)

### Cắt Nghĩa: `cv2.Sobel(img_gray, cv2.CV_64F, 1, 0, ksize=3)`
* **Tại sao không dùng kiểu ảnh gốc `cv2.CV_8U` mà phải là `cv2.CV_64F`?**
  - Đây là câu hỏi kinh điển! Sobel là phép lấy **đạo hàm** (sự chênh lệch giữa điểm kế tiếp trừ đi điểm hiện tại).
  - Khi chuyển từ màu Trắng sang Đen (ví dụ pixel 200 tụt xuống 50), đạo hàm $50 - 200 = -150$ (số âm).
  - Chuẩn màu ảnh bình thường (`uint8`) KHÔNG CHỨA ĐƯỢC số âm. Nó sẽ tự động cắt số `-150` về `0` (màu đen). Việc này làm **mất đi 50% thông tin cạnh**.
  - **Giải pháp:** Bắt buộc dùng `cv2.CV_64F` (float64, hỗ trợ số âm). Sau đó dùng `np.absolute()` để biến âm thành dương, rồi mới ép về `uint8` hiển thị.
* **Các số `1, 0` là gì? Nếu đổi thành `0, 1`?**
  - Số thứ tự là `(dx, dy)`. 
  - `dx=1, dy=0`: Tìm đạo hàm hướng X -> Cạnh thu được là các đường sọc Đứng.
  - `dx=0, dy=1`: Tìm đạo hàm hướng Y -> Cạnh thu được là các đường sọc Ngang.
  - Sau cùng, ta gộp lại bằng độ lớn vector `cv2.magnitude()` để có cạnh ở mọi hướng.

### Cắt Nghĩa: Kernel Emboss (Chạm nổi)
```python
emboss_kernel = np.array([
    [-2, -1, 0],
    [-1,  1, 1],
    [ 0,  1, 2]
])
```
* **Tại sao tổng các phần tử lại bằng 0?**
  - $2 + 1 + 1 - 1 - 1 - 2 = 0$.
  - Ý nghĩa: Với những vùng có màu sắc đồng đều (nền ảnh phẳng), việc nhân chập một cửa sổ có tổng bằng 0 sẽ khiến mọi điểm ảnh biến thành giá trị 0 (màu đen). 
  - Chỉ ở những ranh giới (đổi màu sắc), kết quả mới chênh lệch và khác 0. Kernel này nghiêng từ trái trên xuống phải dưới, tạo ra hiệu ứng đổ bóng ảo giác như được dập nổi (emboss) hoặc khắc lõm vào tường.

---

## 4. LỌC PHI TUYẾN TÍNH (KHỬ NHIỄU)

### Cắt Nghĩa: `cv2.medianBlur(noise_img, 5)`
* **Tại sao chỉ dùng lọc Median (Trung vị) để khử nhiễu muối tiêu? Dùng Mean có được không?**
  - Dùng lọc Trung bình (Mean) sẽ thất bại nặng nề. Nhiễu muối tiêu là các đốm Trắng chói lóa (255) và Đen tuyền (0). Nếu ta lấy trung bình, 1 điểm 255 sẽ chia đều và làm nguyên vùng xung quanh nó bị "vấy bẩn", tạo ra các mốc xám nhòe nhoẹt.
  - Trong khi đó, bộ lọc Trung Vị sắp xếp các điểm ảnh từ bé đến lớn và **chỉ lấy phần tử nằm giữa**. Nhờ đó, các giá trị nhiễu cực đoan (0 và 255) bị ném sang 2 phía của dãy số và bị vứt bỏ hoàn toàn. Bức ảnh sẽ cực kỳ sạch sẽ.

### Cắt Nghĩa: `cv2.bilateralFilter(noise_img, 9, 75, 75)`
* **Tại sao hàm này phức tạp và có nhiều con số vậy? Ý nghĩa là gì?**
  - Lọc Bilateral cực mạnh (hay dùng cho Beauty Camera) vì nó **vừa làm mờ, vừa bảo tồn các cạnh sắc nét** (không làm nhòe tóc, mí mắt). 
  - **Số `9`**: Đường kính không gian lân cận.
  - **Số `75` thứ nhất (sigmaColor):** Độ lệch cho phép về MÀU SẮC. Nó bảo máy tính rằng: "Chỉ lấy trung bình những pixel nào có màu chênh lệch với tôi tối đa tầm 75 đơn vị thôi nhé. Đứa nào màu khác xa quá (vượt qua biên giới/cạnh) thì đứng ra ngoài không tính trung bình".
  - **Số `75` thứ hai (sigmaSpace):** Độ lệch cho phép về TỌA ĐỘ. Càng ở xa tâm thì trọng lượng ảnh hưởng càng ít.
  - *Nếu tăng 75 thứ nhất (sigmaColor) lên mức khổng lồ (vd: 2000)?* Bilateral filter sẽ bị ngu đi, nó coi bất kì màu nào cũng là đồng bọn và gộp hết lại để tính trung bình. Lúc này nó thoái hóa, biến thành 1 bộ lọc Gaussian bình thường, làm mờ đi mọi thứ.
