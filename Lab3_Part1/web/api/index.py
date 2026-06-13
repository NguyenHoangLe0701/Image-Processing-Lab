"""
Flask API — Wavelet Image Similarity
Xử lý so sánh tương đồng hình ảnh bằng biến đổi Wavelet + Hamming Distance.
Hoạt động cả local (python api/index.py) và Vercel serverless.
"""

import os
import io
import base64
import numpy as np
import pywt
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

# ── Cấu hình ──────────────────────────────────────────────
IMG_SIZE = (256, 256)
DWT_LEVEL = 2
SIMILARITY_THRESHOLD = 0.85
SUPPORTED_WAVELETS = ['haar', 'db2', 'db4', 'sym2', 'coif1', 'bior1.3']


# ── Hàm tiện ích ──────────────────────────────────────────

def decode_image(b64_string: str) -> np.ndarray:
    """Giải mã base64 → ảnh grayscale numpy array (256×256)."""
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    raw = base64.b64decode(b64_string)
    img = Image.open(io.BytesIO(raw)).convert('L')
    img = img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    return np.array(img)


def array_to_data_url(arr: np.ndarray) -> str:
    """Chuyển numpy array → data:image/png;base64,..."""
    arr = np.abs(arr).astype(np.float64)
    lo, hi = arr.min(), arr.max()
    if hi > lo:
        arr = (arr - lo) / (hi - lo) * 255.0
    arr = arr.astype(np.uint8)
    img = Image.fromarray(arr, mode='L')
    buf = io.BytesIO()
    img.save(buf, format='PNG', optimize=True)
    encoded = base64.b64encode(buf.getvalue()).decode('ascii')
    return f'data:image/png;base64,{encoded}'


def extract_wavelet(img: np.ndarray, wavelet: str = 'haar', level: int = DWT_LEVEL):
    """Biến đổi wavelet rời rạc 2D."""
    return pywt.wavedec2(img.astype(np.float64), wavelet, level=level)


def create_hash(coeffs) -> np.ndarray:
    """Tạo mã băm nhị phân từ hệ số xấp xỉ (cA)."""
    approx = coeffs[0]
    mean_val = np.mean(approx)
    return (approx >= mean_val).astype(np.uint8).flatten()


def hamming(h1: np.ndarray, h2: np.ndarray) -> tuple:
    """Tính Hamming distance và similarity."""
    dist = int(np.sum(h1 != h2))
    sim = 1.0 - dist / len(h1)
    return dist, sim


def subbands_to_images(coeffs) -> dict:
    """Chuyển 4 sub-band wavelet → base64 images."""
    cA = coeffs[0]
    cH, cV, cD = coeffs[1]
    return {
        'cA': array_to_data_url(cA),
        'cH': array_to_data_url(cH),
        'cV': array_to_data_url(cV),
        'cD': array_to_data_url(cD),
    }


# ── API Routes ─────────────────────────────────────────────

@app.route('/api/compare', methods=['POST'])
def compare():
    """So sánh 2 ảnh bằng wavelet hash."""
    try:
        data = request.get_json(force=True)
        wavelet = data.get('wavelet', 'haar')
        if wavelet not in SUPPORTED_WAVELETS:
            wavelet = 'haar'

        img1 = decode_image(data['image1'])
        img2 = decode_image(data['image2'])

        coeffs1 = extract_wavelet(img1, wavelet, DWT_LEVEL)
        coeffs2 = extract_wavelet(img2, wavelet, DWT_LEVEL)

        hash1 = create_hash(coeffs1)
        hash2 = create_hash(coeffs2)
        dist, sim = hamming(hash1, hash2)

        side = int(np.sqrt(len(hash1)))
        h1_img = (hash1.reshape(side, side) * 255).astype(np.uint8)
        h2_img = (hash2.reshape(side, side) * 255).astype(np.uint8)
        diff = ((hash1 != hash2).reshape(side, side) * 255).astype(np.uint8)

        return jsonify({
            'success': True,
            'image1': {
                'grayscale': array_to_data_url(img1),
                'wavelet': subbands_to_images(coeffs1),
                'hash_preview': array_to_data_url(h1_img),
            },
            'image2': {
                'grayscale': array_to_data_url(img2),
                'wavelet': subbands_to_images(coeffs2),
                'hash_preview': array_to_data_url(h2_img),
            },
            'comparison': {
                'hamming_distance': dist,
                'similarity': round(sim, 6),
                'similarity_pct': round(sim * 100, 2),
                'total_bits': int(len(hash1)),
                'is_similar': sim >= SIMILARITY_THRESHOLD,
                'threshold': SIMILARITY_THRESHOLD,
                'diff_preview': array_to_data_url(diff),
                'wavelet_used': wavelet,
            },
        })
    except KeyError as e:
        return jsonify({'success': False, 'error': f'Thiếu trường: {e}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/compare-wavelets', methods=['POST'])
def compare_wavelets():
    """So sánh 2 ảnh với nhiều loại wavelet cùng lúc."""
    try:
        data = request.get_json(force=True)
        img1 = decode_image(data['image1'])
        img2 = decode_image(data['image2'])

        results = []
        for wv in SUPPORTED_WAVELETS:
            try:
                c1 = extract_wavelet(img1, wv, DWT_LEVEL)
                c2 = extract_wavelet(img2, wv, DWT_LEVEL)
                h1 = create_hash(c1)
                h2 = create_hash(c2)
                dist, sim = hamming(h1, h2)
                results.append({
                    'wavelet': wv,
                    'distance': dist,
                    'similarity': round(sim, 6),
                    'similarity_pct': round(sim * 100, 2),
                })
            except Exception:
                pass
        return jsonify({'success': True, 'results': results})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ── Phục vụ file tĩnh (chỉ dùng khi chạy local) ──────────

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

@app.route('/')
def serve_index():
    return send_from_directory(ROOT, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(ROOT, path)


if __name__ == '__main__':
    print('[*] Wavelet Studio dang chay tai http://localhost:5000')
    app.run(debug=True, host='0.0.0.0', port=5000)
