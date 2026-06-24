"""
Flask API — NeuraMatch Studio
Photo Matching sử dụng Siamese Network + CNN (PyTorch).
Hoạt động cả local (python app.py) và deploy trên Render.
"""

import os
import io
import base64
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
import torchvision.transforms as transforms
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Cho phép frontend (Vercel) gọi API

# ══════════════════════════════════════════════════════════
# CẤU HÌNH
# ══════════════════════════════════════════════════════════
EMBEDDING_DIM = 128
IMG_SIZE = (224, 224)
DEFAULT_THRESHOLD = 1.0
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'siamese_model.pth')

# Tự động nhận diện thiết bị CPU/GPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'[*] Device: {device}')

# ══════════════════════════════════════════════════════════
# KIẾN TRÚC MÔ HÌNH (phải giống notebook)
# ══════════════════════════════════════════════════════════

class CNNFeatureExtractor(nn.Module):
    """CNN trích xuất đặc trưng: ResNet18 pre-trained + FC layers."""

    def __init__(self, embedding_dim=128):
        super(CNNFeatureExtractor, self).__init__()
        resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        self.backbone = nn.Sequential(*list(resnet.children())[:-1])
        self.fc = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, embedding_dim)
        )

    def forward(self, x):
        x = self.backbone(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x


class SiameseNetwork(nn.Module):
    """Siamese Network: 2 ảnh → CNN (shared weights) → Euclidean Distance."""

    def __init__(self, embedding_dim=128):
        super(SiameseNetwork, self).__init__()
        self.cnn = CNNFeatureExtractor(embedding_dim=embedding_dim)

    def forward(self, img_a, img_b):
        feat_a = self.cnn(img_a)
        feat_b = self.cnn(img_b)
        distance = F.pairwise_distance(feat_a, feat_b, keepdim=True)
        return feat_a, feat_b, distance


# ══════════════════════════════════════════════════════════
# LOAD MODEL
# ══════════════════════════════════════════════════════════

model = SiameseNetwork(embedding_dim=EMBEDDING_DIM).to(device)

if os.path.exists(MODEL_PATH):
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()
    print(f'[OK] Model loaded from: {MODEL_PATH}')
    MODEL_LOADED = True
else:
    model.eval()
    print(f'[WARNING] Model not found at: {MODEL_PATH}')
    print(f'[WARNING] Using pre-trained ResNet18 features only (no fine-tuning)')
    MODEL_LOADED = False

# ══════════════════════════════════════════════════════════
# IMAGE TRANSFORMS
# ══════════════════════════════════════════════════════════

transform = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ══════════════════════════════════════════════════════════
# HÀM TIỆN ÍCH
# ══════════════════════════════════════════════════════════

def decode_image(b64_string: str) -> Image.Image:
    """Giải mã base64 → PIL Image RGB."""
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    raw = base64.b64decode(b64_string)
    img = Image.open(io.BytesIO(raw)).convert('RGB')
    return img


def preprocess_image(img: Image.Image) -> torch.Tensor:
    """PIL Image → Tensor (1, 3, 224, 224) chuẩn ImageNet."""
    tensor = transform(img).unsqueeze(0).to(device)
    return tensor


# ══════════════════════════════════════════════════════════
# API ROUTES
# ══════════════════════════════════════════════════════════

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    So sánh 2 ảnh bằng Siamese Network.

    Input (JSON):
        - image1: base64 encoded image
        - image2: base64 encoded image
        - threshold: float (mặc định 1.0)

    Output (JSON):
        - distance: khoảng cách Euclidean
        - is_similar: boolean
        - similarity_pct: phần trăm tương đồng
        - feature1, feature2: feature vectors (để visualization)
    """
    try:
        data = request.get_json(force=True)

        if 'image1' not in data or 'image2' not in data:
            return jsonify({'success': False, 'error': 'Thiếu image1 hoặc image2'}), 400

        threshold = float(data.get('threshold', DEFAULT_THRESHOLD))

        # Đọc và xử lý 2 ảnh
        img1 = decode_image(data['image1'])
        img2 = decode_image(data['image2'])

        tensor1 = preprocess_image(img1)
        tensor2 = preprocess_image(img2)

        # Forward pass qua Siamese Network
        with torch.no_grad():
            feat1, feat2, distance = model(tensor1, tensor2)

        dist_value = distance.item()
        is_similar = dist_value < threshold

        # Tính similarity percentage (dùng hàm sigmoid ngược)
        # Khi distance = 0 → 100%, khi distance = threshold*2 → ~0%
        similarity_pct = max(0, min(100, (1 - dist_value / (threshold * 2)) * 100))

        return jsonify({
            'success': True,
            'distance': round(dist_value, 6),
            'is_similar': is_similar,
            'similarity_pct': round(similarity_pct, 2),
            'threshold': threshold,
            'embedding_dim': EMBEDDING_DIM,
            'model_loaded': MODEL_LOADED,
            'feature1': feat1.squeeze().cpu().tolist(),
            'feature2': feat2.squeeze().cpu().tolist()
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'device': str(device),
        'model_loaded': MODEL_LOADED,
        'embedding_dim': EMBEDDING_DIM
    })


# ══════════════════════════════════════════════════════════
# SERVE STATIC FILES (chỉ khi chạy local)
# ══════════════════════════════════════════════════════════

WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'web')


@app.route('/')
def serve_index():
    """Phục vụ trang chính (chỉ local dev)."""
    return send_from_directory(WEB_DIR, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Phục vụ file tĩnh (chỉ local dev)."""
    return send_from_directory(WEB_DIR, path)


# ══════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════

if __name__ == '__main__':
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models'), exist_ok=True)
    print(f'[*] NeuraMatch API running at http://localhost:5000')
    print(f'[*] Open http://localhost:5000 in your browser')
    app.run(debug=True, host='0.0.0.0', port=5000)
