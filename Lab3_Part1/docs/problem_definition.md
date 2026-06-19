# Problem Definition: Ứng Dụng So Sánh Tương Đồng Hình Ảnh (Wavelet Studio)

---

## 1. Tổng Quan Dự Án

**Tên dự án:** Wavelet Studio - Image Similarity Search  
**Ngôn ngữ lập trình:** Python (Backend) + JavaScript (Frontend)  
**Framework:** Flask (Backend) + HTML/CSS/JS thuần (Frontend)  
**Mục tiêu:** Xây dựng một ứng dụng web cho phép người dùng đánh giá mức độ tương đồng giữa các hình ảnh hoặc tìm kiếm hình ảnh tương tự trong cơ sở dữ liệu dựa trên đặc trưng tần số (sử dụng Discrete Wavelet Transform - DWT) kết hợp với Khoảng cách Hamming.

---

## 2. Phát Biểu Bài Toán

Khi so sánh hai hình ảnh, việc so sánh từng pixel (pixel-by-pixel) thường gặp thất bại nếu ảnh bị nén, thu nhỏ, thay đổi màu sắc hoặc ánh sáng. Bài toán đặt ra là cần xây dựng **một hệ thống có thể trích xuất được bố cục tổng thể và cấu trúc đường nét chính** của bức ảnh mà không bị ảnh hưởng bởi nhiễu, chạy trực tiếp trên nền web, thao tác trực quan và trả về kết quả nhanh chóng (chỉ tính bằng mili-giây). Phương pháp được lựa chọn là sử dụng biến đổi Wavelet và thuật toán băm hình ảnh (Perceptual Hashing).

---

## 3. Đầu Vào (Input)

| Thành phần           | Mô tả                                                    |
| -------------------- | -------------------------------------------------------- |
| **File ảnh**         | Người dùng kéo thả hoặc tải lên từ máy tính qua giao diện web |
| **Định dạng hỗ trợ** | `.jpg`, `.jpeg`, `.png` (Ảnh sẽ được tự động resize về 256x256 và chuyển sang Grayscale ở Frontend/Backend) |
| **Tham số xử lý**    | Người dùng chọn loại Wavelet (Haar, db2, db4, sym2, coif1, bior1.3) để so sánh |
| **Cơ sở dữ liệu**    | Một thư mục `database/` chứa các hình ảnh mẫu để phục vụ tính năng tìm kiếm |

---

## 4. Các Chức Năng Xử Lý (Processing Features)

### 4.1. So Sánh Hai Ảnh (1-to-1 Comparison)

- Nhận 2 ảnh từ người dùng.
- Trích xuất đặc trưng Wavelet ở cấp độ 4 (Level 4 DWT).
- Tạo mã băm nhị phân cho từng ảnh dựa trên giá trị Median của các hệ số xấp xỉ (cA) và chi tiết (cH, cV, cD).
- Tính khoảng cách Hamming và quy đổi ra tỷ lệ % tương đồng.
- Phân loại kết quả thành các mức độ: Exact (Giống hoàn toàn), Similar (Tương đối giống), None (Khác biệt).

### 4.2. So Sánh Đa Wavelet

- Chạy thuật toán so sánh đồng thời trên tất cả các loại Wavelet được hỗ trợ.
- Hiển thị bảng tổng hợp để so sánh hiệu suất và độ nhạy của từng loại hàm Wavelet đối với cùng một cặp ảnh.

### 4.3. Tìm Kiếm Hình Ảnh (Image Search 1:N)

- Nhận 1 ảnh truy vấn (Query Image) từ người dùng.
- Quét toàn bộ hình ảnh trong thư mục `database/` trên server.
- Tính độ tương đồng giữa ảnh truy vấn và từng ảnh trong cơ sở dữ liệu.
- Trả về danh sách các bức ảnh giống nhất (tối đa 48 kết quả), sắp xếp theo độ tương đồng giảm dần.

---

## 5. Đầu Ra (Output)

| Thành phần         | Mô tả                                                     |
| ------------------ | --------------------------------------------------------- |
| **Kết quả 1-1**    | % tương đồng, khoảng cách Hamming, mã băm (dạng hình ảnh minh họa), ảnh biểu diễn sự khác biệt giữa 2 mã băm. |
| **Kết quả tìm kiếm**| Lưới hình ảnh (Grid) các kết quả tìm được trong CSDL, ghi chú mức độ % giống với ảnh truy vấn. |
| **Trực quan hóa**  | Hiển thị các sub-bands của biến đổi Wavelet (cA, cH, cV, cD) ngay trên giao diện web bằng cách trả về chuỗi Base64. |

---

## 6. Kiến Trúc Hệ Thống

```
[Trình duyệt (HTML/CSS/JS)]
        │
        │  Gửi chuỗi JSON chứa ảnh dạng Base64 (fetch API)
        ▼
[Flask Server (Vercel Serverless / Local)]
        │
        ├── /api/compare          → Trả về % tương đồng và mã băm
        ├── /api/compare-wavelets → Đánh giá bằng nhiều hàm Wavelet
        ├── /api/search           → Quét thư mục database/ và xếp hạng ảnh
        └── /api/samples          → Lấy ảnh ngẫu nhiên làm mẫu thử
        │
        ▼
[PyWavelets + Numpy + Pillow] (Xử lý thuật toán in-memory)
        │
        ▼
[Thư mục database/] (Chứa ảnh gốc cho tính năng Search)
```

---

## 7. Công Nghệ Sử Dụng

| Thành phần      | Công nghệ                                    |
| --------------- | -------------------------------------------- |
| **Backend**     | Python 3.x, Flask                            |
| **Thuật toán**  | PyWavelets, NumPy, Pillow                    |
| **Frontend**    | HTML5, CSS3, ES6 JavaScript (không dùng React/Vue) |
| **Giao tiếp**   | HTTP REST API (JSON chứa dữ liệu ảnh Base64)  |
| **Lưu trữ tạm** | Không lưu file vật lý. Xử lý in-memory toàn bộ. |
| **Triển khai**  | Vercel Serverless Function (`vercel.json`)   |

---

## 8. Cấu Trúc Thư Mục Dự Kiến

```
Lab3_Part1/
│
├── web/
│   ├── api/
│   │   └── index.py            # API Backend chính (Flask), chứa logic Wavelet
│   ├── database/               # Thư mục chứa ảnh mẫu (jpg/png) cho tính năng Image Search
│   ├── app.js                  # Frontend logic (xử lý UI, gọi API, resize canvas)
│   ├── index.html              # Giao diện chính của ứng dụng
│   ├── style.css               # Styling cho giao diện (Vanilla CSS)
│   ├── requirements.txt        # Các thư viện Python
│   └── vercel.json             # Cấu hình deploy Vercel
│
├── notebooks/                  # Chứa file lab4_wavelet_hashing.ipynb thử nghiệm
└── docs/                       # Tài liệu dự án
```

---

## 9. Yêu Cầu Phi Chức Năng

- **Đơn giản & Trực quan:** Giao diện có tính năng kéo thả mượt mà, render ngay lập tức mã băm hình ảnh và biểu đồ dạng vòng cung (SVG rings).
- **Tối ưu Băng thông:** Frontend cần vẽ ảnh lên `<canvas>` và nén về 256x256 thành định dạng `image/jpeg` chất lượng 0.8 trước khi gửi lên API để tránh lỗi payload quá lớn (413 Payload Too Large).
- **Không Trạng thái (Stateless):** Không sử dụng Database (như SQL/NoSQL). Toàn bộ ảnh xử lý nằm trong RAM, không ghi file tạm. Phù hợp tuyệt đối với môi trường serverless.
- **Tốc độ:** So sánh ảnh hoặc tìm kiếm trong tập DB mẫu hoàn thành với độ trễ thấp (< 2 giây).

---

## 10. Phạm Vi Ngoài Dự Án (Out of Scope)

- Xác thực người dùng / đăng nhập / cấp quyền.
- Lưu trữ lịch sử tìm kiếm hoặc lưu trữ đám mây các hình ảnh tải lên.
- Triển khai CSDL thực thụ (như PostgreSQL, MongoDB) hoặc Elasticsearch.
- Các thao tác xử lý ảnh nâng cao khác như nhận diện khuôn mặt (Face Recognition) hay phân vùng ảnh (Segmentation).

---

## 11. Tiêu Chí Hoàn Thành (Definition of Done)

- [ ] Người dùng có thể kéo thả tải ảnh lên dễ dàng.
- [ ] Tính năng so sánh 2 ảnh (1-to-1) trả về chính xác % tương đồng, Hamming distance, hiển thị hình minh họa các sub-bands.
- [ ] Tính năng tìm kiếm (Image Search) trả về đúng danh sách ảnh tương tự lấy ra từ thư mục `database/` đã sắp xếp.
- [ ] Hệ thống chống chịu được ảnh nhiễu, ảnh khác kích thước, trả về % tương đồng khách quan.
- [ ] Frontend vẽ mượt mà, call API không sập, chặn thành công lỗi quá dung lượng.
- [ ] Ứng dụng chạy thành công trên Vercel Serverless hoặc local qua `python api/index.py`.
