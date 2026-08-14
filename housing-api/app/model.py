import json
from pathlib import Path
from typing import List

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model" / "model.pkl"
METRICS_PATH = BASE_DIR / "model" / "metrics.json"

FEATURE_COLUMNS = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]


class ModelService:
    """Loads the trained pipeline + metrics once and serves predictions."""

    def __init__(self):
        self.pipeline = None
        self.metrics = None
        self._load()

    def _load(self):
        if MODEL_PATH.exists():
            self.pipeline = joblib.load(MODEL_PATH)
        if METRICS_PATH.exists():
            with open(METRICS_PATH) as f:
                self.metrics = json.load(f)

    @property
    def is_loaded(self) -> bool:
        return self.pipeline is not None

    def predict(self, records: List[dict]) -> List[float]:
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Run train.py to generate model/model.pkl")
        df = pd.DataFrame(records)[FEATURE_COLUMNS]
        preds = self.pipeline.predict(df)
        return [float(p) for p in preds]

    def get_metrics(self) -> dict:
        if self.metrics is None:
            raise RuntimeError("Metrics not found. Run train.py to generate model/metrics.json")
        return self.metrics


# Singleton instance used by the API
model_service = ModelService()
