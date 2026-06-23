# Bài Thực Hành Chương 1: TỔNG QUAN THỊ GIÁC MÁY TÍNH & XỬ LÝ ẢNH

> Bài thực hành nhập môn về xử lý ảnh số — làm quen với OpenCV, Pillow và các thao tác cơ bản nhất trên ảnh số: đọc/ghi ảnh, không gian màu, cắt/resize, vẽ hình.

Bên cạnh việc giải các bài tập thực hành trên Jupyter Notebook, nhóm đã xây dựng thêm một **Web App "Image Basics Studio"** để trực quan hóa các thao tác xử lý ảnh cơ bản theo thời gian thực, giúp người xem dễ hình dung hơn so với chỉ đọc code tĩnh.

---

## 1. Phát Biểu Bài Toán (Problem Definition)

Dựa trên nội dung lý thuyết Chương 1 (Tổng quan về Thị giác máy tính và Xử lý ảnh) và đề bài "Bài thực hành chương 1", bài thực hành tập trung vào:

1. **Lý thuyết nền:** Hiểu khái niệm ảnh số (pixel, ma trận điểm ảnh, độ phân giải, độ sâu màu), phân biệt Xử lý ảnh và Thị giác máy tính, các không gian màu RGB/HSV/CMYK/LAB.
2. **Thực hành:** Cài đặt thư viện OpenCV/Pillow; đọc – hiển thị – lưu ảnh; chuyển đổi không gian màu; cắt xén & thay đổi kích thước ảnh; vẽ hình cơ bản và thêm văn bản lên ảnh.
3. **Mở rộng:** Trực quan hóa các thao tác trên thông qua một Web App tương tác chạy thời gian thực ngay trên trình duyệt.

---

## 2. Kế Hoạch Triển Khai (Implementation Plan)

- **Ngôn ngữ & Thư viện:** Python (OpenCV, Pillow, NumPy, Matplotlib).
- **Môi trường Notebook:** Gộp toàn bộ 5 phần bài tập vào **một file duy nhất** `Lab1_ThucHanh.ipynb` để dễ theo dõi tuần tự từ cơ bản đến nâng cao hơn.
- **Ứng dụng Web mở rộng:** Triển khai Web App nhỏ (**Image Basics Studio**) bằng HTML/JS thuần + Vite, dùng `OpenCV.js` để demo trực quan: đổi không gian màu, cắt/resize, vẽ hình & chữ lên ảnh — minh chứng các thao tác xử lý ảnh cơ bản hoạt động thế nào trong thực tế.

---

## 3. Cấu Trúc Thư Mục

```text
Lab1/
│
├── 📄 README.md                     ← Tổng quan dự án (Bạn đang ở đây)
├── 📄 requirements.txt              ← Danh sách thư viện cần cài
├── 📄 rules.md                      ← Quy tắc làm việc (Dành riêng cho trợ lý AI tuân thủ)
│
├── 📓 Lab1_ThucHanh.ipynb           ← Notebook gộp cả 5 bài thực hành chương 1
│
├── 📁 docs/                         ← Tài liệu báo cáo Web App
│   ├── problem_definition.md        ← Giới hạn phạm vi (Scope/Out of Scope)
│   ├── implement_plan.md            ← Kế hoạch kỹ thuật chi tiết
│   └── walkthrough.md               ← Hướng dẫn trải nghiệm & deploy
│
├── 📁 web/                          ← 🌟 SOURCE CODE WEB APP IMAGE BASICS STUDIO
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   ├── vite.config.js
│   ├── package.json
│   └── public/
│       └── opencv.js
│
└── 📁 data/
    └── 📁 input/                    ← Chứa các ảnh thực tế để test (tự upload)
```

---

## 4. Hướng Dẫn Cài Đặt & Chạy (Jupyter Notebook)

### 4.1. Cài đặt thư viện

```bash
pip install -r requirements.txt
```

### 4.2. Chuẩn bị ảnh thực hành

1. Đặt ảnh test của bạn vào thư mục `data/input/` (ví dụ: `data/input/sample.jpg`).
2. Mở `Lab1_ThucHanh.ipynb`, sửa biến `IMAGE_PATH` ở đầu notebook trỏ đến ảnh của bạn.

### 4.3. Chạy Notebook

Mở Jupyter Notebook hoặc VS Code, chạy lần lượt từng cell trong **`Lab1_ThucHanh.ipynb`** — notebook đã được tổ chức theo đúng 5 mục của đề bài:

1. Cài đặt thư viện (kiểm tra phiên bản)
2. Đọc & hiển thị & lưu ảnh
3. Chuyển đổi không gian màu (Grayscale, HSV, LAB)
4. Cắt xén & thay đổi kích thước ảnh
5. Vẽ hình cơ bản & thêm văn bản

---

## 5. Trải Nghiệm Trực Tiếp Web App (Live Demo)

Bạn có thể quét mã QR dưới đây hoặc truy cập trực tiếp vào link dự án đã deploy để trải nghiệm Web App:

![Mã QR truy cập Web App](QR.jpg)

### 5.1. Chạy Web App Local

1. Di chuyển vào thư mục web: `cd web`
2. Cài package: `npm install`
3. Chạy server: `npm run dev`
4. Truy cập `http://localhost:5173` trên trình duyệt.

Web App cho phép tải ảnh lên và xem trực quan, thời gian thực các phép biến đổi: chuyển không gian màu, crop/resize bằng kéo-thả, và vẽ hình/chữ chú thích — đúng các thao tác đã học trong notebook nhưng ở dạng tương tác.

### 5.2. Hướng dẫn Deploy Web App lên Vercel

Dự án này sử dụng Vite, nên việc đưa lên Vercel cực kỳ đơn giản:

1. **Đẩy code lên GitHub:** Chắc chắn rằng repository `Image-Processing-Lab` của bạn đã được cập nhật mới nhất.
2. **Import vào Vercel:** Truy cập [Vercel](https://vercel.com/), đăng nhập bằng GitHub, chọn **Add New... > Project** và import repository này.
3. **Cấu hình thư mục gốc (Rất quan trọng):** 
   - Trong phần cấu hình trước khi deploy, tìm mục **Root Directory**.
   - Nhấn **Edit** và chọn đúng thư mục chứa web là: `Lab1/web`.
4. **Cấu hình Build:** Vercel sẽ tự động nhận dạng Framework là **Vite**. Các thông số `Build Command` (`npm run build`) và `Output Directory` (`dist`) cứ giữ nguyên mặc định.
5. **Deploy:** Nhấn nút **Deploy**. Sau khi hoàn tất, Vercel sẽ tạo cho bạn một đường link public (ví dụ: `your-project.vercel.app`) để truy cập online ở bất kỳ đâu.
6. **Cập nhật QR:** Khi đã có link, bạn có thể tạo mã QR mới, đặt tên file là `QR.jpg` để trong thư mục `Lab1` và commit lên Github để cập nhật hình ảnh QR ở trên.
---

## 6. Kết Quả Đạt Được

- ✅ **Lý thuyết vững chắc:** Hiểu khái niệm ảnh số, pixel, không gian màu và sự khác biệt giữa Xử lý ảnh và Thị giác máy tính.
- ✅ **Thực hành đầy đủ:** Thành thạo các thao tác I/O ảnh, chuyển không gian màu, biến đổi hình học, và vẽ chú thích bằng OpenCV/Pillow.
- ✅ **Sản phẩm thực tế:** Xây dựng thành công Web App trực quan hóa các thao tác xử lý ảnh cơ bản.

> **Môn học:** Xử Lý Ảnh & Thị Giác Máy Tính  
> **Chương:** 1 — Tổng Quan Thị Giác Máy Tính và Xử Lý Ảnh
