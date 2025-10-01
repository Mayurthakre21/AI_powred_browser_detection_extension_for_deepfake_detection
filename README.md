# AI powered browser extension for deepfake detection
Deepfakes are AI-generated synthetic media that can manipulate faces and voices in videos. This poses risks in misinformation, fraud, and security. The objective of this project is to build a real-time browser extension with a deep learning backend that detects deepfake videos and provides users with instant alerts.

🏗️ System Architecture
flowchart TD
    A[Browser Extension] -->|Extract Frames| B[Flask Backend]
    B -->|Send Frames| C[Deep Learning Model]
    C -->|Prediction (Real/Fake + Confidence)| B
    B -->|Result| A
    A -->|Popup Alert| User
    B --> D[PostgreSQL Database]

⚙️ Tech Stack
Frontend (Extension): HTML, CSS, JavaScript
Backend: Flask, Python, PostgreSQL
Model: CNN / Xception (Keras + TensorFlow)
Tools: Google Colab (training), VS Code (development), Chrome Extension API

🧠 Deep Learning Model
Model Architecture:
  Input: Frames (224x224 RGB)
  Preprocessing: Resize, normalize [0,1], augmentation (rotation, flip, shift)
  Layers:
    Conv2D (filters=32, kernel=3x3, ReLU) → MaxPool2D
    Conv2D (filters=64, kernel=3x3, ReLU) → MaxPool2D
    Conv2D (filters=128, kernel=3x3, ReLU) → MaxPool2D
    Flatten
  Dense (128 neurons, ReLU)
  Dropout (0.5)
  Dense (1 neuron, Sigmoid for binary classification)
  Optimizer: Adam (lr=0.0001)
  Loss: Binary Cross-Entropy
  
📊 Dataset
Source:FaceForensics++
Frame extraction: 1 frame/sec
Train/Validation/Test Split: 70:20:10
Augmentation: rotation, horizontal flip, zoom, shift

🚀 Training Details
Batch Size: 32
Epochs:50
GPU: Google Colab Tesla T4

🔧 Backend (Flask + PostgreSQL)
POST /predict → Accepts image/frame → Returns prediction
GET /history → Fetch past detections from DB

Database Schema:
detections(id, video_url, prediction, confidence, timestamp)
Model loading: TensorFlow .h5 file preloaded into Flask app

🎨 Frontend (Browser Extension)
Captures video frames using <canvas> API
Sends frames to Flask API via fetch()
Receives JSON response → { prediction: "Fake", confidence: 92.4 }
Popup UI shows:
  ✅ Real or ❌ Fake
  Confidence score
  Timestamp of detection

📌 Future Improvements
Real-time streaming support
Larger and more diverse dataset
Integration with cloud inference
Support for Firefox/Edge extensions

👨‍💻 Authors
Mayur Thakre (Team Lead, Model + Backend  Development)
Rutuja kurwale (frontend + Backend Development)
Rishikesh Ghadole (model development)
Yash Katgeye (model development)


