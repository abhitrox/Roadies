from flask import Flask, request, jsonify
from flask_cors import CORS  # Need this to allow your HTML to talk to Python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    
    try:
        # Load Data
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file)
        else:
            return jsonify({"error": "Format must be CSV or JSON"}), 400

        # Feature Engineering
        # We expect columns: 'hour' (0-23) and 'ride_count'
        X = df[['hour']]
        y = df['ride_count']

        # Train Model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)

        # Generate 24-hour Forecast
        future_hours = pd.DataFrame({'hour': range(24)})
        predictions = model.predict(future_hours)
        
        # Calculate Mock Confidence Interval (for visual fascination)
        # In real ML, we'd use prediction_intervals, here we simulate ±15%
        upper_bound = (predictions * 1.15).tolist()
        lower_bound = (predictions * 0.85).tolist()

        return jsonify({
            "status": "success",
            "forecast": predictions.tolist(),
            "upper": upper_bound,
            "lower": lower_bound,
            "labels": [f"{h}:00" for h in range(24)],
            "peak": int(np.max(predictions)),
            "avg": int(np.mean(predictions))
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)