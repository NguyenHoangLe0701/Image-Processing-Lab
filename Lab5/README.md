# NeuraMatch Studio — Photo Matching với Siamese Network + CNN

> Bài thực hành 5 — Xử lý ảnh

<div align="center">
  <img src="QR.jpg" alt="Mã QR trải nghiệm ứng dụng" width="250" />
  <p><em>Quét mã QR bên trên để truy cập và trải nghiệm ứng dụng NeuraMatch Studio trên điện thoại của bạn!</em></p>
</div>

Ứng dụng web so khớp ảnh (Photo Matching) sử dụng kiến trúc **Siamese Network** kết hợp **CNN (ResNet18)** và **Contrastive Loss**, xây dựng bằng PyTorch.



## Cấu trúc dự án

```
Lab5/
├── photo_matching.ipynb     # Notebook 9 bước (train model)
├── requirements.txt         # Dependencies cho notebook
├── data/input/              # Dataset huấn luyện
│   ├── similar/             # Cặp ảnh giống nhau
│   └── dissimilar/          # Cặp ảnh khác nhau
├── web/                     # Frontend → Deploy Vercel
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── vercel.json
└── server/                  # Backend → Deploy Render
    ├── app.py               # Flask API
    ├── requirements.txt
    ├── render.yaml
    └── models/
        └── siamese_model.pth  # Model đã train (copy từ notebook)
```

## Chạy local

### 1. Train model (Jupyter Notebook)
```bash
cd Lab5
pip install -r requirements.txt
jupyter notebook photo_matching.ipynb
```

### 2. Chạy backend
```bash
cd Lab5/server
pip install -r requirements.txt
python app.py
```
→ API chạy tại `http://localhost:5000`

### 3. Mở frontend
Truy cập `http://localhost:5000` (backend serve cả frontend)

## Deploy

### Frontend → Vercel
1. Import repo vào Vercel
2. Root Directory: `Lab5/web`
3. Framework Preset: Other
4. Cập nhật `API_BASE` trong `app.js` thành URL Render

### Backend → Render
1. New Web Service trên Render
2. Root Directory: `Lab5/server`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`

## Kiến trúc

```
Image A ──→ CNN (ResNet18) ──→ Feature A (128-dim) ──┐
                (shared weights)                       ├──→ Euclidean Distance → Verdict
Image B ──→ CNN (ResNet18) ──→ Feature B (128-dim) ──┘
```

## Công nghệ

- **Model**: PyTorch, ResNet18 pre-trained, Siamese Network, Contrastive Loss
- **Backend**: Flask, Flask-CORS, Gunicorn
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Deploy**: Vercel (frontend) + Render (backend)
