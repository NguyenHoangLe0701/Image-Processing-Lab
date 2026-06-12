# 🔍 Bài Thực Hành Chương 2 (Phần 2): CANNY EDGE DETECTOR

> Bài thực hành về thuật toán phát hiện cạnh Canny — một trong những thuật toán quan trọng nhất trong Xử lý ảnh và Thị giác máy tính. 

Đặc biệt trong bài thực hành này, ngoài việc giải quyết các bài tập lý thuyết và thực hành truyền thống, nhóm đã xây dựng thêm một **Web App Chuyên Nghiệp** để trình diễn thuật toán theo thời gian thực!

---

## 1. Phát Biểu Bài Toán (Problem Definition)

Dựa trên yêu cầu của đề bài, bài thực hành tập trung vào việc hiểu sâu và ứng dụng thuật toán Canny.
**Mục tiêu chính:**
1. **Lý thuyết:** Phân tích 5 bước của thuật toán Canny (giảm nhiễu, gradient, NMS, ngưỡng kép, theo dõi cạnh), so sánh với các toán tử khác (Sobel, Laplacian) và hiểu ý nghĩa các tham số.
2. **Thực hành:** Ứng dụng OpenCV và Scikit-image để phát hiện cạnh. Đánh giá sự thay đổi của các tham số (Sigma, ngưỡng thấp, ngưỡng cao) lên kết quả. Khảo sát thuật toán trên ảnh nhiễu, tương phản thấp và kết hợp Canny với phân đoạn/nhận dạng.
3. **Mở rộng:** Nghiên cứu cách đánh giá chất lượng cạnh, cải thiện hiệu suất, xử lý ảnh màu và áp dụng cho video.

---

## 2. Kế Hoạch Triển Khai (Implementation Plan)

Để giải quyết trọn vẹn bài toán một cách khoa học, project được cấu trúc thành các thành phần:
- **Ngôn ngữ & Thư viện:** Python (OpenCV, skimage, matplotlib, numpy).
- **Môi trường Notebook:** 
  - Tách biệt thành 3 phần bám sát đề bài: Lý thuyết (Phần 1), Thực hành (Phần 2), Mở rộng (Phần 3) để người đọc dễ theo dõi.
  - Ngoài ra cung cấp 1 file tổng hợp `Canny_Edge_Detector.ipynb` dành cho việc nộp bài nguyên khối.
- **Ứng dụng Web mở rộng:** Triển khai một Web App nhỏ (Canny Edge Studio) bằng HTML/JS thuần và Vite để demo thuật toán Canny chạy realtime trên trình duyệt, minh chứng cho tính ứng dụng thực tế.

---

## 3. Cấu Trúc Thư Mục

```text
Lab2_Part2/
│
├── 📄 README.md                     ← Tổng quan dự án (Bạn đang ở đây)
├── 📄 requirements.txt              ← Danh sách thư viện cần cài
├── 📄 rules.md                      ← Quy tắc làm việc (Dành riêng cho trợ lý AI tuân thủ)
│
├── 📓 Phan1_LyThuyet_Canny.ipynb    ← Phần I: Trả lời lý thuyết thuật toán
├── 📓 Phan2_ThucHanh_Canny.ipynb    ← Phần II: Code thực hành và so sánh
├── 📓 Phan3_MoRong.ipynb            ← Phần III: Các câu hỏi nâng cao (Ảnh màu, Video...)
├── 📓 Canny_Edge_Detector.ipynb     ← File gộp toàn bộ 3 phần (dùng để nộp bài)
│
├── 📁 docs/                         ← Tài liệu báo cáo Web App
│   ├── problem_definition.md        ← Giới hạn phạm vi (Scope/Out of Scope)
│   └── implement_plan.md            ← Kế hoạch kỹ thuật chi tiết
│
├── 📁 web/                          ← 🌟 SOURCE CODE WEB APP CANNY STUDIO
│   ├── index.html                   
│   ├── main.js                      
│   ├── style.css                    
│   └── vite.config.js               
│
└── 📁 data/
    └── 📁 input/                    ← Chứa các ảnh thực tế để test
```

---

## 4. Hướng Dẫn Cài Đặt & Chạy (Jupyter Notebook)

### 4.1. Cài đặt thư viện

Mở terminal và cài đặt các thư viện cần thiết:
```bash
pip install -r requirements.txt
```

### 4.2. Chuẩn bị ảnh thực hành

1. Đảm bảo bạn đã có các ảnh test trong thư mục `data/input/`.
2. Mở các file Notebook (`Phan2_ThucHanh_Canny.ipynb`), chỉnh sửa đường dẫn hàm đọc ảnh `cv2.imread()` nếu bạn dùng ảnh tùy chỉnh.

### 4.3. Chạy Notebook

Mở Jupyter Notebook hoặc VS Code, chạy lần lượt theo thứ tự:
1. **`Phan1_LyThuyet_Canny.ipynb`**
2. **`Phan2_ThucHanh_Canny.ipynb`**
3. **`Phan3_MoRong.ipynb`**

---

## 5. Trải Nghiệm Trực Tiếp Web App (Live Demo)

Bạn có thể tự mình trải nghiệm ứng dụng **Canny Edge Studio** ngay trên điện thoại hoặc máy tính bằng cách quét mã QR bên dưới:

<div align="center">
  <img src="data/input/QR.png" alt="QR Code Canny Web App" width="300"/>
  <p><i>Quét để mở ứng dụng Canny Edge Studio</i></p>
</div>

**Chạy Web App Local:**
1. Di chuyển vào thư mục web: `cd web`
2. Cài package: `npm install`
3. Chạy server: `npm run dev`
4. Truy cập `http://localhost:5173` trên trình duyệt.

---

## 6. Kết Quả Đạt Được

- ✅ **Lý thuyết vững chắc:** Hiểu được bản chất toán học của 5 bước thuật toán Canny và vai trò của từng tham số.
- ✅ **Thực hành chuyên sâu:** Biết cách chọn tham số (Blur, Threshold) phù hợp cho từng điều kiện ảnh cụ thể (nhiễu, tương phản).
- ✅ **Sản phẩm thực tế:** Xây dựng thành công một Web App xử lý ảnh Canny realtime.

> **Môn học:** Xử Lý Ảnh  
> **Chương:** 2 — Phát hiện cạnh (Edge Detection)  
> **Thuật toán:** Canny Edge Detector (John F. Canny, 1986)
