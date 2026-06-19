# Problem Definition: Hệ Thống So Sánh Tương Đồng Hình Ảnh (Wavelet Image Similarity)

---

## 1. Tổng Quan Dự Án

**Tên dự án:** Wavelet Studio - Image Similarity Search
**Ngôn ngữ lập trình:** Python (Backend) + JavaScript (Frontend)
**Framework:** Flask (Backend, hỗ trợ Serverless) + HTML5/CSS3/JS thuần (Frontend)
**Mục tiêu:** Xây dựng ứng dụng web cho phép người dùng so sánh độ tương đồng giữa hai hình ảnh hoặc tìm kiếm hình ảnh tương đồng trong cơ sở dữ liệu dựa trên đặc trưng tần số (sử dụng biến đổi Wavelet) và khoảng cách băm (Hamming Distance).

---

## 2. Phát Biểu Bài Toán

Việc so sánh hình ảnh thông thường bằng cách đối chiếu từng pixel rất dễ bị ảnh hưởng bởi nhiễu, thay đổi kích thước, hoặc độ sáng. Bài toán đặt ra là làm thế nào để rút trích được những **đặc trưng cốt lõi** của hình ảnh (bố cục, đường nét, kết cấu) và so sánh chúng một cách nhanh chóng. 
Giải pháp được lựa chọn là sử dụng **Discrete Wavelet Transform (DWT)** để phân tích ảnh ở các dải tần số khác nhau, từ đó tạo ra một "mã băm nhị phân" (Image Hash) đặc trưng. Cuối cùng, dùng **Khoảng cách Hamming** để đánh giá mức độ giống nhau giữa các mã băm.

---

## 3. Đầu Vào (Input)

| Thành phần           | Mô tả                                                    |
| -------------------- | -------------------------------------------------------- |
| **Ảnh cần so sánh**  | Người dùng tải lên 2 ảnh (để so sánh 1-1) hoặc 1 ảnh (để tìm kiếm) |
| **Định dạng hỗ trợ** | `.jpg`, `.jpeg`, `.png` (Ảnh tải lên sẽ được resize về 256x256 và chuyển sang Grayscale) |
| **Tham số thuật toán**| Loại Wavelet (Haar, Daubechies 2/4, Symlets, Coiflets, Biorthogonal) |
| **Cơ sở dữ liệu**    | Thư mục `database/` chứa các ảnh mẫu dùng cho tính năng tìm kiếm |

---

## 4. Các Chức Năng Cốt Lõi (Core Features)

### 4.1. So Sánh Hai Ảnh (1-to-1 Comparison)
- Nhận 2 ảnh từ người dùng.
- Trích xuất đặc trưng Wavelet ở cấp độ 4 (Level 4 DWT).
- Tạo mã băm nhị phân cho từng ảnh dựa trên giá trị Median của các hệ số xấp xỉ (cA) và chi tiết (cH, cV, cD).
- Tính khoảng cách Hamming và quy đổi ra % tương đồng.
- Phân loại kết quả: Exact (Giống hoàn toàn), Similar (Tương đối giống), None (Khác biệt).

### 4.2. So Sánh Đa Wavelet (Compare Wavelets)
- Đánh giá độ tương đồng của 2 ảnh trên nhiều loại Wavelet khác nhau (Haar, db2, db4, sym2, coif1, bior1.3) cùng một lúc để thấy sự khác biệt về hiệu năng trích xuất đặc trưng.

### 4.3. Tìm Kiếm Hình Ảnh (Image Search)
- Nhận 1 ảnh truy vấn (Query Image).
- Quét qua toàn bộ hình ảnh trong thư mục `database/`.
- Tính độ tương đồng giữa ảnh truy vấn và từng ảnh trong CSDL.
- Trả về danh sách (tối đa 48 ảnh) sắp xếp theo độ tương đồng giảm dần.

---

## 5. Đầu Ra (Output)

| Thành phần         | Mô tả                                                     |
| ------------------ | --------------------------------------------------------- |
| **Kết quả 1-1**    | % tương đồng, khoảng cách Hamming, mã băm (dạng hình ảnh minh họa), ảnh biểu diễn sự khác biệt giữa 2 mã băm. |
| **Kết quả tìm kiếm**| Lưới hình ảnh các kết quả tìm được trong CSDL, ghi chú mức độ % giống với ảnh truy vấn. |
| **Trực quan hóa**  | Hiển thị các sub-bands của biến đổi Wavelet (cA, cH, cV, cD) ngay trên giao diện web. |

---

## 6. Kiến Trúc Hệ Thống

```text
[Trình duyệt (HTML/CSS/JS thuần)]
        │
        │  Gửi ảnh dạng Base64 qua JSON (AJAX / Fetch API)
        ▼
[Flask Backend (Vercel Serverless / Local)]
        │
        ├── /api/compare        → Trả về % tương đồng và mã băm
        ├── /api/compare-wavelets → Đánh giá bằng nhiều hàm Wavelet
        ├── /api/search         → Quét thư mục database/ và xếp hạng ảnh
        └── /api/samples        → Lấy ảnh ngẫu nhiên làm mẫu thử
        │
        ▼
[PyWavelets + Numpy + Pillow] (Xử lý thuật toán)
        │
        ▼
[Thư mục database/] (Chứa ảnh tìm kiếm)
```

---

## 7. Yêu Cầu Kỹ Thuật & Môi Trường

| Tiêu chí        | Chi tiết                                     |
| --------------- | -------------------------------------------- |
| **Backend**     | Python 3, Flask 3.1.*                        |
| **Thư viện**    | PyWavelets (1.8.*), Numpy (1.26.*), Pillow (11.*) |
| **Frontend**    | HTML5, CSS3, ES6 JavaScript (không dùng framework như React/Vue để tối ưu tốc độ và đơn giản hóa việc deploy) |
| **Lưu trữ**     | Xử lý "In-memory", truyền ảnh bằng chuỗi Base64, không lưu file vật lý trên server (trừ DB mẫu). |
| **Deploy**      | Hỗ trợ chạy local bằng python và deploy lên nền tảng Vercel thông qua `vercel.json` |

---

## 8. Tiêu Chí Hoàn Thành (Definition of Done)
- [ ] Giao diện Web hiển thị đẹp mắt, trực quan và responsive.
- [ ] Tính năng chọn ảnh mẫu và upload ảnh hoạt động mượt mà.
- [ ] Hàm tạo mã băm Wavelet trích xuất đúng đặc trưng và không bị sập (crash) khi ảnh phức tạp.
- [ ] Tính năng so sánh trả về kết quả nhanh (< 2 giây).
- [ ] Tính năng tìm kiếm quét được các ảnh có trong thư mục `database/` và xếp hạng chính xác.
- [ ] Ứng dụng chạy thành công cả ở môi trường Local và Serverless Vercel.
