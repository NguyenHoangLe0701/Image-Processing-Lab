# Hướng Dẫn & Vấn Đáp Lab 2: Các Phép Biến Đổi Điểm Ảnh & Lọc Không Gian

Dựa trên framework **5W1H + HGCR** (What, Why, Where, Which, How -> Human, Guide, Controller, Render), tài liệu này sẽ tổ chức lại các kiến thức từ Bài thực hành chương 2 để bạn dễ dàng hiểu sâu, làm bài và bảo vệ trước hội đồng.

---

## TỔ CHỨC THƯ MỤC
Dự án được tổ chức như sau:
```
Lab2/
├── data/                       # Chứa các ảnh đầu vào (Ví dụ: hãy thả ảnh tên sample.jpg vào đây)
├── notebooks/                  
│   └── Lab2_ThucHanh.py        # Code thực hành (Dạng Python script với Jupyter cell markers `# %%`). Có thể chạy bằng VS Code Interactive Window.
├── requirements.txt            # Thư viện cần thiết
└── HuongDan_Va_VanDap.md       # Tài liệu hướng dẫn chi tiết này
```

---

## PHẦN I: TOÁN TỬ ĐIỂM ẢNH (Point Operations)
Đây là các phép xử lý trực tiếp trên từng pixel (điểm ảnh) một cách độc lập, không phụ thuộc vào các pixel xung quanh.

### 1. What (Đó là gì?)
- **Độ sáng (Brightness):** Tổng thể mức độ sáng hay tối của ảnh. Toán học: Cộng/trừ đi một hằng số.
- **Độ tương phản (Contrast):** Sự khác biệt (khoảng cách) giữa các vùng sáng nhất và tối nhất. Toán học: Nhân với một hằng số.
- **Âm bản (Negative):** Đảo ngược giá trị cường độ sáng (sáng thành tối, tối thành sáng). Toán học: $255 - pixel$.
- **Cắt ngưỡng (Thresholding):** Phân mảnh ảnh, đưa các pixel thành 2 giá trị (trắng/đen) dựa trên một điểm mốc (ngưỡng).

### 2. Why (Tại sao cần làm?)
- Ảnh chụp bị thiếu sáng, bị chói hoặc mù sương (cần chỉnh độ sáng/tương phản để phục hồi).
- Cần loại bỏ phông nền, tìm bóng hoặc phát hiện vật thể (cắt ngưỡng để tạo ra ảnh nhị phân - mask).
- Ảnh âm bản giúp làm nổi bật các chi tiết màu trắng mỏng bị chìm trên phông nền tối.

### 3. Where (Dùng ở đâu trong thực tế?)
- **Ứng dụng chỉnh sửa ảnh (Lightroom, Photoshop):** Kéo thanh sáng tối (Exposure/Contrast).
- **Máy scan tài liệu/CamScanner:** Dùng Thresholding để biến nền giấy xám thành trắng tinh, và chữ viết thành đen tuyền.
- **Chẩn đoán y khoa:** Phim X-quang xương, MRI thường thao tác âm bản để bác sĩ dễ nhìn thấy vết vôi hóa.

### 4. Which (Chọn thuật toán nào?)
- Chỉ muốn làm rõ hình bị sương mù: Chỉnh **Contrast**.
- Tách vật thể rõ ràng ra khỏi nền đen/trắng: Dùng **Thresholding**.

### 5. How (Thực thi như thế nào?)
- **Human (Tư duy con người):** Nếu mắt ta thấy nguyên bức hình bị tối, ta muốn mọi điểm ảnh đều phải cộng thêm ánh sáng lên đồng đều.
- **Guide (Nguyên lý Toán học):** 
  - $I_{new}(x,y) = \alpha * I_{old}(x,y) + \beta$ (Trong đó $\alpha$ là tương phản, $\beta$ là độ sáng).
  - Cần phải dùng hàm "clip" để giới hạn kết quả không vượt quá mức cho phép [0-255].
- **Controller (Code Logic điều khiển):** 
  - OpenCV có `cv2.add()` giúp cộng và tự động "cắt gọt" (saturate cast) nếu tràn số.
  - `cv2.convertScaleAbs(img, alpha, beta)` giúp tính toán phép nhân cộng tuyến tính.
  - `cv2.threshold()` giúp so sánh cắt ngưỡng cực nhanh.
- **Render (Hiển thị):** Map ma trận ảnh kết quả qua hàm `imshow()` của thư viện Matplotlib.

---

## PHẦN II & III: LỌC TUYẾN TÍNH & PHI TUYẾN TÍNH (Spatial Filtering)
Đây là phép xử lý điểm ảnh cục bộ, tính toán giá trị pixel mới dựa trên nó và vùng các pixel xung quanh. Sử dụng một cửa sổ trượt (gọi là Kernel/Mask/Window) quét qua toàn bộ bức ảnh.

### 1. What (Đó là gì?)
- **Lọc trung bình (Mean):** Pixel mới là trung bình cộng của vùng cửa sổ.
- **Lọc Gaussian:** Lấy trung bình nhưng "có trọng số". Pixel ở giữa đóng góp nhiều nhất, giảm dần khi ra xa.
- **Lọc Median (Phi tuyến):** Lấy giá trị "chính giữa" (trung vị) sau khi đã sắp xếp các pixel theo thứ tự tăng dần.
- **Phát hiện cạnh (Sobel/Prewitt):** Tính đạo hàm của ảnh để tìm sự thay đổi đột ngột về cường độ sáng.

### 2. Why (Tại sao cần lọc?)
- **Khử nhiễu (Noise reduction):** Cảm biến camera bị lỗi hoặc thiếu sáng tạo ra nhiễu hạt (noise). Phải lọc để làm sạch ảnh.
- **Trích xuất đặc trưng (Feature extraction):** Máy tính không hiểu nguyên "con chó" là gì, nó cần tìm các "đường viền/cạnh" trước để nhận diện hình dáng vật thể.

### 3. Where (Dùng ở đâu?)
- **Camera an ninh:** Khử nhiễu hạt khi quay ban đêm (thường dùng Median/Gaussian filter).
- **Hệ thống xe tự lái:** Phát hiện vạch kẻ đường, lề đường (Dùng thuật toán phát hiện Cạnh).
- **App làm đẹp (Beauty cam/Tiktok filter):** Dùng lọc Bilateral (Làm mịn da mặt nhưng giữ nguyên độ sắc nét của lông mi, chân mày).

### 4. Which (Khi nào dùng bộ lọc nào?)
- **Nhiễu hạt mịn rải đều (Nhiễu Gaussian):** Dùng *Gaussian Filter*.
- **Nhiễu chấm trắng/đen ngẫu nhiên dơ bẩn (Nhiễu Muối tiêu):** BẮT BUỘC dùng *Median Filter*.
- **Làm mờ mịn nhưng GIỮ LẠI CẠNH, không bị nhòe hình:** Dùng *Bilateral Filter*.
- **Tìm biên cạnh của đồ vật:** Dùng *Sobel* hoặc *Prewitt*.

### 5. How (Thực thi như thế nào?)
- **Human (Tư duy):** 
  - *Để làm mờ:* Một điểm bị nhiễu sai khác màu quá lớn, ta nhìn xung quanh nó xem đám đông màu gì, ta "đồng hóa" nó thành màu trung bình của đám đông.
  - *Để tìm cạnh:* Cạnh là ranh giới giữa 2 vùng màu khác nhau (vd nền trắng, áo đen). Ta tìm sự chênh lệch màu lớn nhất giữa 2 điểm đứng cạnh nhau.
- **Guide (Nguyên lý Toán học):** 
  - Phép Tích chập (Convolution). Lấy ma trận ảnh nhân chập với ma trận Kernel (ví dụ 3x3).
  - Kernel của làm mờ thì tổng của nó bằng 1.
  - Kernel của tìm cạnh (đạo hàm) thì tổng của nó bằng 0.
- **Controller (Code logic):**
  - OpenCV cho phép tự chế Kernel bằng hàm `cv2.filter2D()`.
  - Các hàm tiện ích có sẵn: `cv2.GaussianBlur()`, `cv2.medianBlur()`, `cv2.Sobel()`.
- **Render (Hiển thị):** Vẽ lên bằng Matplotlib. **Lưu ý cực kỳ quan trọng**: Tính cạnh bằng đạo hàm (Sobel) sẽ sinh ra số ÂM. Nếu vứt thẳng lên màn hình ảnh sẽ bị lỗi. Cần phải lấy **trị tuyệt đối** (Absolute) sau đó ép về kiểu số nguyên 8-bit `uint8` thì mới thành màu chuẩn.

---

## CÂU HỎI VẤN ĐÁP THƯỜNG GẶP (Q&A Bảo Vệ Thực Hành)

**Q1: Khi thay đổi độ sáng bằng cách cộng một số, ví dụ pixel 200 + thêm 100 = 300, nhưng hệ màu uint8 chỉ có giới hạn 0-255. Chuyện gì sẽ xảy ra nếu code bằng python thuần?**
> **Đáp:** Nếu dùng numpy hoặc python cộng thông thường (`img + 100`), nó sẽ bị **tràn số (overflow)**. Số 300 sẽ bị reset quay vòng về $300 - 256 = 44$, khiến một điểm đáng lẽ phải cực sáng lại biến thành màu đen tối. 
> *Cách giải quyết:* Dùng `cv2.add()`, hàm này hỗ trợ *saturate cast* (cắt gọt), giá trị nào cộng vào lớn hơn 255 sẽ bị ép cứng về mức tối đa là 255.

**Q2: Tại sao lọc Median (Trung vị) lại trị được nhiễu Muối tiêu (Salt and Pepper) tốt hơn lọc Mean (Trung bình)?**
> **Đáp (Theo góc nhìn Human-Guide):** 
> - Nhiễu muối tiêu là các điểm cực đoan mang giá trị tối đa (trắng tinh-255) hoặc tối thiểu (đen thui-0). 
> - Nếu dùng Mean (Trung bình): Giống như thu nhập bình quân của 1 xóm bị kéo vống lên nếu có 1 tỷ phú lọt vào. Điểm nhiễu sẽ kéo sai lệch cả vùng xung quanh, làm vùng đó bị nhòe đi nhưng hạt nhiễu thì không mất hẳn.
> - Nếu dùng Median (Trung vị): Ta xếp các con số trong vùng xung quanh theo thứ tự. Giá trị cực đoan (0, 255) luôn bị ném về 2 đầu rìa. Việc lấy điểm "đứng giữa" (Trung vị) chắc chắn sẽ nhặt được một pixel bình thường, qua đó loại bỏ sạch sẽ điểm nhiễu.

**Q3: Kernel là gì? Cấu trúc của một Kernel phát hiện cạnh khác gì với kernel làm mờ?**
> **Đáp:** Kernel (Mặt nạ/Cửa sổ) là một ma trận số nhỏ (ví dụ 3x3 hoặc 5x5) dùng để trượt qua tính toán trên ảnh.
> - **Kernel làm mờ:** Thường gồm toàn các số dương, tổng trọng số của toàn kernel luôn bằng `1` (để giữ nguyên độ sáng tổng thể của ảnh, không làm nó sáng lên hay tối đi).
> - **Kernel phát hiện cạnh:** Gồm các giá trị âm và dương đối xứng (ví dụ [-1, 0, 1]), tổng trọng số của toàn kernel luôn bằng `0`. Mục đích là vùng nào màu giống nhau thì triệt tiêu về 0 (đen), vùng nào chênh lệch màu thì tạo ra con số lớn (sáng lên thành viền).
