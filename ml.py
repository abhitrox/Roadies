import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta

# 1. SIMULATE 10 DAYS OF CONTEXTUAL DATA
def generate_mock_data():
    data = []
    start_date = datetime(2026, 4, 1)
    for day in range(10):  # 10 days of history
        current_date = start_date + timedelta(days=day)
        is_weekend = 1 if current_date.weekday() >= 5 else 0
        
        for hour in range(24):
            # Base logic: midday peak, higher on weekends
            base_rides = 10 + (hour * 2 if hour < 14 else (24-hour) * 2)
            noise = np.random.randint(-5, 5)
            ride_count = max(0, base_rides + (10 if is_weekend else 0) + noise)
            
            data.append({
                'timestamp': current_date + timedelta(hours=hour),
                'hour': hour,
                'day_of_week': current_date.weekday(),
                'is_weekend': is_weekend,
                'ride_count': ride_count
            })
    return pd.DataFrame(data)

df = generate_mock_data()

# 2. FEATURE ENGINEERING
# We add a "Lag Feature" - what happened 24 hours ago?
df['prev_day_count'] = df['ride_count'].shift(24).fillna(df['ride_count'].mean())

# Define Features (X) and Target (y)
features = ['hour', 'day_of_week', 'is_weekend', 'prev_day_count']
X = df[features]
y = df['ride_count']

# 3. TRAIN THE AI MODEL
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X, y)

# 4. PREDICT FOR "TOMORROW" (The 11th Day)
def predict_next_day(model, last_day_counts):
    tomorrow = []
    # Assume tomorrow is a Monday (0)
    for h in range(24):
        tomorrow.append({
            'hour': h,
            'day_of_week': 0, 
            'is_weekend': 0,
            'prev_day_count': last_day_counts[h]
        })
    
    tomorrow_df = pd.DataFrame(tomorrow)
    return model.predict(tomorrow_df[features])

# Get the last 24 entries to act as 'prev_day_count'
last_24_hours = df['ride_count'].tail(24).values
predictions = predict_next_day(model, last_24_hours)

print("Forecast for the next 24 hours:")
print(predictions.astype(int))