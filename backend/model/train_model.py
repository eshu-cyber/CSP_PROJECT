"""
train_model.py
Trains a RandomForestClassifier on symptom data and saves the model.
Run this once before starting the Flask server:  python model/train_model.py
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "../data/symptom_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# ── Feature columns (order matters – must match predict.py) ──────────────────
FEATURE_COLS = [
    "pain_level",         # 1–10
    "swelling",           # 0=none, 1=mild, 2=severe
    "bruising",           # 0/1
    "mobility_loss",      # 0=none, 1=partial, 2=complete
    "point_tenderness",   # 0/1
    "deformity_visible",  # 0/1
    "injury_mechanism",   # 0=twist/fall, 1=direct impact, 2=crush
    "weight_bearing_possible",  # 0/1
]
LABEL_COL = "label"


def load_data():
    df = pd.read_csv(DATA_PATH)
    print(f"[INFO] Dataset loaded: {len(df)} rows")
    print(f"[INFO] Label distribution:\n{df[LABEL_COL].value_counts().to_string()}\n")
    return df


def train(df):
    X = df[FEATURE_COLS].values
    y = df[LABEL_COL].values

    # Encode string labels → integers
    le = LabelEncoder()
    y_enc = le.fit_transform(y)          # e.g. fracture=0, normal=1, sprain=2

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    # ── Evaluation ────────────────────────────────────────────────────────────
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"[RESULT] Test accuracy: {acc:.2%}\n")
    print("[RESULT] Classification report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    print("[RESULT] Confusion matrix:")
    print(confusion_matrix(y_test, y_pred))
    print()

    # ── Feature importance ────────────────────────────────────────────────────
    importances = dict(zip(FEATURE_COLS, model.feature_importances_))
    sorted_imp = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("[INFO] Feature importances (ranked):")
    for feat, imp in sorted_imp:
        bar = "█" * int(imp * 40)
        print(f"  {feat:<28} {imp:.4f}  {bar}")

    return model, le


def save(model, le):
    payload = {"model": model, "label_encoder": le, "features": FEATURE_COLS}
    joblib.dump(payload, MODEL_PATH)
    print(f"\n[SAVED] Model saved → {MODEL_PATH}")


if __name__ == "__main__":
    df = load_data()
    model, le = train(df)
    save(model, le)
