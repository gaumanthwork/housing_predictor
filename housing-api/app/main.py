from typing import List, Union

from fastapi import FastAPI, HTTPException

from app.model import model_service
from app.schemas import (
    CoefficientsInfo,
    CrossValidation,
    HealthResponse,
    HouseFeatures,
    ModelInfoResponse,
    PredictionResult,
    PredictResponse,
    TestMetrics,
)

app = FastAPI(
    title="Housing Price Prediction API",
    description=(
        "A simple regression model API that predicts housing prices from "
        "features such as square footage, bedrooms, bathrooms, lot size, "
        "distance to city center, and school rating."
    ),
    version="1.0.0",
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health():
    """Simple health check endpoint."""
    return HealthResponse(status="ok", model_loaded=model_service.is_loaded)


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
def model_info():
    """Returns model coefficients, intercept, and performance metrics."""
    try:
        metrics = model_service.get_metrics()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return ModelInfoResponse(
        model_type=metrics["model_type"],
        trained_at=metrics["trained_at"],
        n_samples=metrics["n_samples"],
        n_train=metrics["n_train"],
        n_test=metrics["n_test"],
        target=metrics["target"],
        coefficients=CoefficientsInfo(
            features=metrics["features"],
            coefficients=metrics["coefficients"],
            intercept=metrics["intercept"],
        ),
        test_metrics=TestMetrics(**metrics["test_metrics"]),
        cross_validation=CrossValidation(**metrics["cross_validation"]),
    )


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(payload: Union[HouseFeatures, List[HouseFeatures]]):
    """
    Predict housing price(s).   

    Accepts either:
    - a single house feature object, or
    - a list of house feature objects (batch prediction)
    """
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model is not loaded. Train the model first.")

    if isinstance(payload, list):
        houses: List[HouseFeatures] = payload
    else:
        houses = [payload]

    records = [h.model_dump() for h in houses]

    try:
        preds = model_service.predict(records)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")

    return PredictResponse(
        count=len(preds),
        predictions=[PredictionResult(predicted_price=round(p, 2)) for p in preds],
    )


@app.get("/", tags=["Health"])
def root():
    return {"message": "Housing Price Prediction API. See /docs for interactive Swagger UI."}
