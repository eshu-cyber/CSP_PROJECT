"""
predict.py
Loads the saved model and exposes predict_injury() for use by the Flask API.
"""

import os
import numpy as np
import joblib

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# Cached payload so we only load from disk once per process
_payload = None


def _load():
    global _payload
    if _payload is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "model.pkl not found. Run  python model/train_model.py  first."
            )
        _payload = joblib.load(MODEL_PATH)
    return _payload


# ── Recommendation messages per diagnosis ────────────────────────────────────
RECOMMENDATIONS = {
    "fracture": (
        "⚠️  High likelihood of a fracture. Please visit an emergency department or "
        "orthopaedic clinic immediately. Do NOT put weight on the injured area. "
        "Immobilise the limb and apply ice wrapped in cloth."
    ),
    "sprain": (
        "🟡  Likely a sprain. Follow R.I.C.E. — Rest, Ice (20 min every 2 hrs), "
        "Compression bandage, Elevation. If pain does not improve within 48 hrs "
        "or worsens, consult a doctor."
    ),
    "normal": (
        "✅  Minor injury detected. Rest the area, avoid strenuous activity for "
        "24–48 hrs and monitor for any worsening symptoms. No immediate medical "
        "visit required."
    ),
}


def predict_injury(symptoms: dict) -> dict:
    """
    Parameters
    ----------
    symptoms : dict
        Keys must match FEATURE_COLS in train_model.py.
        Example:
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

    Returns
    -------
    dict with keys:
        diagnosis         – "fracture" | "sprain" | "normal"
        confidence        – float 0‒1
        probabilities     – dict of all class probabilities
        recommended_action – human-readable advice string
    """
    payload = _load()
    model   = payload["model"]
    le      = payload["label_encoder"]
    features = payload["features"]

    # Build feature vector in the correct column order
    try:
        X = np.array([[float(symptoms[f]) for f in features]])
    except KeyError as e:
        raise ValueError(f"Missing symptom field: {e}")

    # Predict
    class_idx   = model.predict(X)[0]
    proba_arr   = model.predict_proba(X)[0]
    diagnosis   = le.inverse_transform([class_idx])[0]
    confidence  = float(proba_arr[class_idx])

    # All class probabilities as a labelled dict
    all_proba = {
        le.inverse_transform([i])[0]: round(float(p), 4)
        for i, p in enumerate(proba_arr)
    }

    return {
        "diagnosis":          diagnosis,
        "confidence":         round(confidence, 4),
        "probabilities":      all_proba,
        "recommended_action": RECOMMENDATIONS.get(diagnosis, "Please consult a doctor."),
    }
