# Kịch Bản Thuyết Trình Lab 4: So Sánh Sự Tương Đồng Của Các Hình Ảnh Sử Dụng Wavelet Hashing

Tài liệu này cung cấp kịch bản phân chia công việc và lời thoại thuyết trình mẫu dành cho bài Lab 4. Dựa trên số lượng thành viên, bạn có thể chọn kịch bản 3 người hoặc 2 người dưới đây.

---

## 🌟 Kịch Bản Dành Cho Nhóm 3 Thành Viên (Khuyên dùng)

Luồng xử lý của bài toán chia làm 3 giai đoạn tự nhiên: **Tiền xử lý -> Thuật toán cốt lõi -> Đánh giá tổng thể**.

### 1️⃣ Thành Viên 1: Giới thiệu & Chuẩn bị dữ liệu, Tiền xử lý
**Nhiệm vụ:** Đặt vấn đề, thu hút sự chú ý của người nghe và giải thích phần đầu của pipeline (Bước 1 & Bước 2).

**Gợi ý lời thoại:**
> "Chào thầy và các bạn. Hôm nay nhóm chúng em xin trình bày về Bài thực hành số 4: Ứng dụng biến đổi Wavelet để đo lường mức độ tương đồng giữa các hình ảnh.
> 
> Để bắt đầu, chúng ta cần một tập dữ liệu. (Mở slide/notebook phần Bước 1). Ở Bước 1, nhóm em đã chuẩn bị một tập các hình ảnh gồm các 'cặp ảnh giống nhau' (chỉ bị xoay, nhiễu, đổi độ sáng) và các 'cặp ảnh khác nhau' hoàn toàn. Để máy tính dễ xử lý, các ảnh này được chuyển sang ảnh xám (grayscale) và đưa về cùng một kích thước chuẩn.
>
> Tiếp theo ở Bước 2, chúng em áp dụng biến đổi Wavelet rời rạc 2D (DWT). Các bạn có thể thấy trên hình, biến đổi này tách ảnh gốc thành 4 thành phần tần số khác nhau: cA (đại diện cho cấu trúc tổng thể), và cH, cV, cD (đại diện cho các đường viền ngang, dọc, chéo). Trong bài toán này, phần cA mang thông tin quan trọng nhất để tạo 'dấu vân tay' cho ảnh, mà bạn [Tên TV 2] sẽ giải thích ngay sau đây."

### 2️⃣ Thành Viên 2: Thuật toán lõi (Hashing & So sánh)
**Nhiệm vụ:** Giải thích trái tim của thuật toán: làm sao để từ một bức ảnh biến thành một chuỗi nhị phân (Bước 3 & Bước 4).

**Gợi ý lời thoại:**
> "Cảm ơn [Tên TV 1]. Tiếp theo, mình xin trình bày Bước 3: Tạo mã băm hay còn gọi là Wavelet Hash. 
> 
> Từ ma trận cA mà [Tên TV 1] vừa nhắc tới, chúng mình tính giá trị trung bình (mean) của tất cả các phần tử. Sau đó, áp dụng một ngưỡng đơn giản: phần tử nào lớn hơn hoặc bằng trung bình thì gán bằng 1, nhỏ hơn thì gán bằng 0. Kết quả, chúng mình thu được một chuỗi nhị phân 1 và 0. Chuỗi này chính là 'dấu vân tay' của bức ảnh.
>
> Đến Bước 4, làm sao để biết 2 ảnh có giống nhau không? Chúng mình sử dụng 'Khoảng cách Hamming' để so sánh 2 mã băm. Khoảng cách Hamming đơn giản là số lượng bit khác nhau giữa hai chuỗi. Nếu hai ảnh là tương tự nhau, khoảng cách này sẽ rất nhỏ (gần 0). Ngược lại, nếu ảnh khác nhau hoàn toàn, số bit sai lệch sẽ rất lớn. (Chỉ vào biểu đồ phân bố). Như các bạn thấy trên biểu đồ Histogram này, hai nhóm ảnh giống và khác nhau được tách biệt khá rõ ràng."

### 3️⃣ Thành Viên 3: Đánh giá, Tối ưu & Tổng kết
**Nhiệm vụ:** Dùng các chỉ số đo lường để chứng minh thuật toán hoạt động tốt, đồng thời mở rộng vấn đề (Bước 5 & Nâng cao).

**Gợi ý lời thoại:**
> "Chào mọi người, mình là [Tên TV 3]. Để chứng minh thuật toán của nhóm thực sự hiệu quả, chúng ta cần các con số đánh giá cụ thể ở Bước 5.
>
> Bằng cách thử nghiệm nhiều ngưỡng (threshold) phân loại khác nhau, chúng mình tìm ra được một ngưỡng tối ưu nhất. Nhìn vào Confusion Matrix, các bạn có thể thấy thuật toán dự đoán chính xác bao nhiêu cặp ảnh. (Đọc một vài chỉ số như Accuracy đạt X%, Sensitivity đạt Y%). Đặc biệt, đường cong ROC với chỉ số AUC = [giá trị] cho thấy mô hình phân loại rất tốt.
>
> Ở phần nâng cao, nhóm em không chỉ dùng Wavelet cơ bản là 'Haar', mà còn thử nghiệm các họ Wavelet khác như Daubechies (db2, db4) để xem họ nào cho kết quả tốt nhất. (Đọc kết quả từ bảng).
>
> **Kết luận lại:** Phương pháp Wavelet Hashing rất nhanh và hiệu quả để tìm ảnh trùng lặp. Tuy nhiên nó vẫn có nhược điểm là khá nhạy cảm nếu ảnh bị xoay hoặc thay đổi kích thước quá lớn. Hướng phát triển sắp tới có thể là kết hợp nhiều cấp độ Wavelet để mô hình ổn định hơn. Cảm ơn thầy và các bạn đã lắng nghe!"

---

## 🌟 Kịch Bản Dành Cho Nhóm 2 Thành Viên

Nếu nhóm có 2 người, hãy chia đôi bài toán: Một người trình bày "Cách thức hoạt động" và một người trình bày "Kiểm thử và Đánh giá".

### 1️⃣ Thành Viên 1: Từ Dữ liệu đến Thuật toán cốt lõi (Bước 1 -> Bước 4)
**Nhiệm vụ:** Trình bày từ đầu cho tới khi tính ra được điểm số tương đồng.

**Gợi ý lời thoại:**
> "Chào thầy và các bạn. Em xin đại diện nhóm trình bày luồng hoạt động của hệ thống so sánh ảnh dùng Wavelet. 
> Đầu tiên ở Bước 1, nhóm em chuẩn bị một tập ảnh gồm các cặp giống nhau và khác nhau.
> Sang Bước 2, nhóm sử dụng phép biến đổi Wavelet (DWT) để lấy ra đặc trưng của ảnh, cụ thể là phần hệ số xấp xỉ cA chứa cấu trúc tổng quan nhất của bức hình.
> Ở Bước 3, nhóm tạo mã băm nhị phân bằng cách lấy giá trị trung bình của cA làm ngưỡng lượng tử hóa (>= mean là 1, < mean là 0). Thu được một chuỗi nhị phân đại diện cho bức ảnh.
> Cuối cùng ở Bước 4, để so sánh hai ảnh, chúng em tính 'Khoảng cách Hamming' giữa hai chuỗi nhị phân. Nếu khoảng cách nhỏ tức là hai ảnh giống nhau, và ngược lại. Biểu đồ trên slide cho thấy thuật toán đã tách phân phối của hai nhóm ảnh khá tốt."

### 2️⃣ Thành Viên 2: Đánh giá, Nâng cao & Kết luận (Bước 5 -> Hết)
**Nhiệm vụ:** Đánh giá tính hiệu quả của hệ thống, các cải tiến và kết luận.

**Gợi ý lời thoại:**
> "Tiếp nối phần thuật toán, em xin trình bày cách nhóm đánh giá độ hiệu quả ở Bước 5.
> Để máy tính tự động phân loại 'Giống' hay 'Khác', chúng em cần chọn một ngưỡng (threshold) điểm tương đồng. Dựa trên quá trình thử nghiệm, nhóm đã chọn ra ngưỡng tối ưu nhất mang lại Accuracy cao nhất. Mọi người có thể thấy Confusion Matrix và các chỉ số (Accuracy, Recall) thể hiện mô hình hoạt động hiệu quả. Biểu đồ đường cong ROC cũng cho thấy chỉ số AUC rất cao.
> Hơn thế nữa, ở phần nâng cao, nhóm không chỉ dừng lại ở Wavelet Haar mà còn thử nghiệm các biến đổi phức tạp hơn như db2, db4... để tìm ra phương pháp mang lại chỉ số AUC cao nhất.
> Tóm lại, Wavelet Hashing là một phương pháp nhanh, gọn nhẹ nhưng vẫn tồn tại hạn chế với các biến đổi hình học lớn (như xoay ảnh quá nhiều). Phần trình bày của nhóm đến đây là kết thúc, cảm ơn thầy và các bạn đã lắng nghe."
