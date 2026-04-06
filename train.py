import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib  # Used to save the model

# 1. Load your 10-day dataset
# Ensure your CSV has: hour, day_of_week, is_weekend, prev_day_count, ride_count
print("Loading ride_data.csv...")
try:
    df = pd.read_csv('ride_data.csv')
    print(f"Data loaded: {len(df)} rows, columns: {list(df.columns)}")
except Exception as e:
    print(f"CSV load error: {e}")
    exit(1)

# 2. Define Features and Target
print("Available columns:", list(df.columns))
if 'prev_day_ride_count' in df.columns:
    df['prev_day_count'] = df['prev_day_ride_count']
print("Using features: hour, day_of_week, is_weekend, prev_day_count")
X = df[['hour', 'day_of_week', 'is_weekend', 'prev_day_count']]
y = df['ride_count']

# 3. Initialize and Train
# We use 200 trees for better accuracy with contextual data
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X, y)

# 4. Save the model to a file
joblib.dump(model, 'ride_model.pkl')
print("Model trained and saved as ride_model.pkl")
import os
print("Saved file size:", os.path.getsize('ride_model.pkl'))
