import os
import numpy as np
import cv2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Load model once at server startup
model = load_model("xception_model.h5")
print("✅ [LOG] Model loaded successfully")



# Directory to store downloaded videos and extracted frames
VIDEO_DIR = "deepfake_detection_extension/static"
FRAME_DIR = "video_frames"

os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(FRAME_DIR, exist_ok=True)

# Function to download video from URL
def download_video(url, save_path):
    print(f"⬇️  [LOG] Downloading video from: {url}")
    response = requests.get(url, stream=True)
    with open(save_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    print(f"✅ [LOG] Video saved to: {save_path}")

def predict_from_video(video_path):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Read the middle frame
    cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)
    success, frame = cap.read()
    cap.release()

    if not success:
        raise Exception("Couldn't read frame from video.")

    # Preprocess the frame
    frame = cv2.resize(frame, (299, 299))  # Xception expects 299x299
    frame = frame.astype("float32") / 255.0
    frame = np.expand_dims(frame, axis=0)

    pred = model.predict(frame)[0][0]
    return pred

@app.before_request
def log_every_request():
    print(f"👉 [LOG] {request.method} to {request.path}")

@app.route('/process-video', methods=['POST'])
def process_video():
    print("📥 [LOG] /process-video endpoint was hit")
    try:
        data = request.get_json()
        video_urls = data.get("videos", [])

        if not video_urls:
            return jsonify({"error": "No video URLs received"}), 400

        video_url = video_urls[0]  # Only handling first URL
        video_path = os.path.join(VIDEO_DIR, "input_video.mp4")

        download_video(video_url, video_path)
        pred = predict_from_video(video_path)

        result = {
            "score": float(pred),
            "prediction": "Real" if pred > 0.8 else "Fake",
            "confidence": float(pred)
        }

        print(f"✅ [LOG] Prediction result: {result}")
        return jsonify({
    "score": float(pred),
    "prediction": "Real" if pred > 0.8 else "Fake",
    "confidence": float(pred)
})


    except Exception as e:
        print("❌ [ERROR] Could not process video:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
