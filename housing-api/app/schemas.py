from typing import List, Union

from pydantic import BaseModel, Field


class HouseFeatures(BaseModel):
    square_footage: float = Field(..., gt=0, example=1850, description="Total living area in square feet")
    bedrooms: int = Field(..., ge=0, example=3, description="Number of bedrooms")
    bathrooms: float = Field(..., ge=0, example=2.0, description="Number of bathrooms (can be fractional, e.g. 2.5)")
    year_built: int = Field(..., ge=1800, le=2100, example=1998, description="Year the house was built")
    lot_size: float = Field(..., gt=0, example=7500, description="Lot size in square feet")
    distance_to_city_center: float = Field(..., ge=0, example=5.6, description="Distance to city center in miles")
    school_rating: float = Field(..., ge=0, le=10, example=8.2, description="Nearby school rating (0-10)")



class PredictionResult(BaseModel):
    predicted_price: float


class PredictResponse(BaseModel):
    count: int
    predictions: List[PredictionResult]


class CoefficientsInfo(BaseModel):
    features: List[str]
    coefficients: dict
    intercept: float


class TestMetrics(BaseModel):
    rmse: float
    mae: float
    r2_score: float


class CrossValidation(BaseModel):
    cv_folds: int
    r2_mean: float
    r2_std: float
    r2_scores: List[float]


class ModelInfoResponse(BaseModel):
    model_type: str
    trained_at: str
    n_samples: int
    n_train: int
    n_test: int
    target: str
    coefficients: CoefficientsInfo
    test_metrics: TestMetrics
    cross_validation: CrossValidation


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
