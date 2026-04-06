import os
import json
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from datetime import datetime

app = FastAPI(title="Roadies ML Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    prev_24h: list[float]

@app.get("/")
async def root():
    return {"message": "Roadies ML Prediction API ready. POST to /predict"}

@app.post("/predict")
async def predict(request: PredictRequest):
    try:
        model = joblib.load('ride_model.pkl')
    except FileNotFoundError:
        return {"error": "Model file 'ride_model.pkl' not found. Run python train.py first."}

    # Build tomorrow's features (Monday=0, is_weekend=0)
    tomorrow_features = []
    for h in range(24):
        feat = {
            'hour': h,
            'day_of_week': 0,
            'is_weekend': 0,
            'prev_day_count': request.prev_24h[h]
        }
        tomorrow_features.append(feat)

    df_features = pd.DataFrame(tomorrow_features)
    features = ['hour', 'day_of_week', 'is_weekend', 'prev_day_count']
    predictions = model.predict(df_features[features]).astype(int).tolist()

    return {
        "predictions": predictions,
        "peak": max(predictions),
        "avg": int(np.mean(predictions)),
        "confidence": 0.94  # Mock AI confidence
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

