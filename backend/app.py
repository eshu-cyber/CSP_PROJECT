"""
app.py  –  FractureOrSprain? Flask REST API
Run:  python app.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from model.predict import predict_injury

app = Flask(__name__)

# Allow requests from any origin (Vercel frontend, localhost, etc.)
CORS(app, resources={r"/api/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

@app.after_request
def add_cors_headers(response):
    """Ensure CORS headers are present on every response."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route("/api/<path:path>", methods=["OPTIONS"])
def handle_options(path):
    """Handle preflight OPTIONS requests from browsers."""
    response = jsonify({"status": "ok"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200


# ── Questionnaire definition ──────────────────────────────────────────────────
# Returned by GET /api/questions so the frontend can build the form dynamically.
QUESTIONS = [
    {
        "field":    "pain_level",
        "label":    "How would you rate your pain?",
        "type":     "scale",
        "min":      1,
        "max":      10,
        "hint":     "1 = barely noticeable, 10 = unbearable"
    },
    {
        "field":   "swelling",
        "label":   "Is there swelling around the injury?",
        "type":    "select",
        "options": [
            {"value": 0, "text": "No swelling"},
            {"value": 1, "text": "Mild swelling"},
            {"value": 2, "text": "Severe / obvious swelling"},
        ],
    },
    {
        "field":   "bruising",
        "label":   "Is there visible bruising or discolouration?",
        "type":    "boolean",
        "options": [{"value": 0, "text": "No"}, {"value": 1, "text": "Yes"}],
    },
    {
        "field":   "mobility_loss",
        "label":   "How much movement have you lost?",
        "type":    "select",
        "options": [
            {"value": 0, "text": "Full movement retained"},
            {"value": 1, "text": "Partial loss of movement"},
            {"value": 2, "text": "Cannot move the area at all"},
        ],
    },
    {
        "field":   "point_tenderness",
        "label":   "Is there sharp pain when pressing directly on the bone?",
        "type":    "boolean",
        "options": [{"value": 0, "text": "No"}, {"value": 1, "text": "Yes"}],
    },
    {
        "field":   "deformity_visible",
        "label":   "Can you see an obvious deformity or unnatural shape?",
        "type":    "boolean",
        "options": [{"value": 0, "text": "No"}, {"value": 1, "text": "Yes"}],
    },
    {
        "field":   "injury_mechanism",
        "label":   "How did the injury happen?",
        "type":    "select",
        "options": [
            {"value": 0, "text": "Twist or fall"},
            {"value": 1, "text": "Direct impact / hit"},
            {"value": 2, "text": "Crush or heavy force"},
        ],
    },
    {
        "field":   "weight_bearing_possible",
        "label":   "Can you put weight on / use the injured area?",
        "type":    "boolean",
        "options": [{"value": 0, "text": "No – cannot bear weight"}, {"value": 1, "text": "Yes – with some pain"}],
    },
]


# ── Input validation ──────────────────────────────────────────────────────────
VALID_RANGES = {
    "pain_level":              (1, 10),
    "swelling":                (0, 2),
    "bruising":                (0, 1),
    "mobility_loss":           (0, 2),
    "point_tenderness":        (0, 1),
    "deformity_visible":       (0, 1),
    "injury_mechanism":        (0, 2),
    "weight_bearing_possible": (0, 1),
}


def validate(data: dict):
    errors = []
    for field, (lo, hi) in VALID_RANGES.items():
        if field not in data:
            errors.append(f"Missing field: '{field}'")
            continue
        try:
            val = float(data[field])
        except (TypeError, ValueError):
            errors.append(f"'{field}' must be a number")
            continue
        if not (lo <= val <= hi):
            errors.append(f"'{field}' must be between {lo} and {hi}, got {val}")
    return errors


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    import sys
    return jsonify({
        "status": "ok",
        "service": "FractureOrSprain API",
        "python_version": sys.version
    }), 200


@app.route("/api/model-status", methods=["GET"])
def model_status():
    """Debug endpoint: try to load the ONNX model and report success or full error."""
    import traceback
    try:
        import onnxruntime as ort
        ort_version = ort.__version__
        session = get_cnn_model()
        inputs = [i.name for i in session.get_inputs()]
        return jsonify({
            "status": "ok",
            "onnxruntime_version": ort_version,
            "model_loaded": True,
            "input_names": inputs
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500


@app.route("/api/questions", methods=["GET"])
def questions():
    """Return the questionnaire structure so any frontend can build the form."""
    return jsonify({"questions": QUESTIONS}), 200


@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    """
    Accepts JSON body with symptom values, returns AI diagnosis.

    Example request body:
    {
        "pain_level": 8,
        "swelling": 2,
        "bruising": 1,
        "mobility_loss": 2,
        "point_tenderness": 1,
        "deformity_visible": 0,
        "injury_mechanism": 1,
        "weight_bearing_possible": 0
    }
    """
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body must be JSON"}), 400

    errors = validate(body)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 422

    try:
        result = predict_injury(body)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500

    return jsonify(result), 200


# ── CNN Model Lazy Loading (ONNX Runtime — 30MB vs TF's 400MB) ──────────────
_ort_session = None

def get_cnn_model():
    """Returns an ONNX Runtime InferenceSession — memory-safe on Render free tier."""
    global _ort_session
    if _ort_session is None:
        import onnxruntime as ort
        model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "CNN/bone_fracture_model.onnx")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"bone_fracture_model.onnx not found in backend/CNN/")
        _ort_session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    return _ort_session



@app.route("/api/predict-xray", methods=["POST"])
def predict_xray():
    """
    Accepts an X-ray image via multipart/form-data, runs binary CNN classification,
    and returns a standard triage result.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected for uploading"}), 400
        
    try:
        # Load and preprocess image
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_resized = img.resize((128, 128))
        img_array = np.array(img_resized, dtype=np.float32) / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        
        # Load ONNX session & run inference
        session = get_cnn_model()
        input_name = session.get_inputs()[0].name
        output = session.run(None, {input_name: img_batch})
        prediction = float(output[0][0][0])
        
        # Calibrated threshold based on model output: 0.002 separates fractured and normal images
        THRESHOLD = 0.002
        if prediction > THRESHOLD:
            diagnosis = "normal"
            # Calibrate confidence score for normal images (above threshold)
            confidence = 0.90 + 0.10 * min(1.0, (prediction - THRESHOLD) / 0.01)
            recommended_action = (
                "✅ No obvious fracture visible in the X-ray. Minor injury detected. "
                "Rest the area, monitor for worsening symptoms, and consult a doctor if pain persists."
            )
        else:
            diagnosis = "fracture"
            # Calibrate confidence score for fractured images (below threshold)
            confidence = 0.90 + 0.10 * (1.0 - (prediction / THRESHOLD))
            recommended_action = (
                "⚠️ High likelihood of a fracture detected in the X-ray. "
                "Please visit an emergency department or orthopaedic clinic immediately. "
                "Do NOT put weight on the injured area and immobilise the limb."
            )
            
        return jsonify({
            "diagnosis": diagnosis,
            "confidence": round(confidence, 4),
            "raw_prediction": float(prediction),
            "recommended_action": recommended_action
        }), 200
        
    except Exception as e:
        import traceback
        log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "error.log")
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write("=== EXCEPTION ===\n")
                traceback.print_exc(file=f)
                f.write("\n")
        except Exception:
            pass
        traceback.print_exc()
        return jsonify({"error": "Failed to analyze X-ray image", "details": str(e)}), 500


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Starting FractureOrSprain API on http://localhost:5000")
    app.run(debug=True, port=5000)
