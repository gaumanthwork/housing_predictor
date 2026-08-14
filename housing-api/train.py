"""
Training script for the Housing Price Prediction model.
"""

import json
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

DATA_PATH = "data/House_Price_Dataset.csv"
MODEL_PATH = "model/model.pkl"
METRICS_PATH = "model/metrics.json"

FEATURE_COLUMNS = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]
TARGET_COLUMN = "price"


def main():
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipeline = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("regressor", LinearRegression()),
        ]
    )
    pipeline.fit(X_train, y_train)

    # Hold-out test metrics
    y_pred = pipeline.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    # 5-fold CV R^2 on full dataset for a more robust estimate (small dataset)
    cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="r2")

    regressor: LinearRegression = pipeline.named_steps["regressor"]
    coefficients = dict(zip(FEATURE_COLUMNS, regressor.coef_.tolist()))

    metrics = {
        "model_type": "LinearRegression",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "n_samples": int(len(df)),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
        "coefficients": coefficients,
        "intercept": float(regressor.intercept_),
        "test_metrics": {
            "rmse": rmse,
            "mae": mae,
            "r2_score": r2,
        },
        "cross_validation": {
            "cv_folds": 5,
            "r2_mean": float(cv_scores.mean()),
            "r2_std": float(cv_scores.std()),
            "r2_scores": cv_scores.tolist(),
        },
    }

    joblib.dump(pipeline, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model saved to {MODEL_PATH}")
    print(f"Metrics saved to {METRICS_PATH}")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
