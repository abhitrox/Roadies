import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set seed for reproducibility
np.random.seed(42)

data = []
start_date = datetime(2026, 3, 27) # Starting 10 days before today

for day in range(10):
    current_date = start_date + timedelta(days=day)
    day_of_week = current_date.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    
    for hour in range(24):
        # 1. Base Demand Logic
        # Morning Rush (7-9 AM) and Evening Rush (4-7 PM)
        if 7 <= hour <= 9 or 16 <= hour <= 19:
            base_rides = np.random.randint(40, 70)
        # Late Night (1-4 AM)
        elif 1 <= hour <= 4:
            base_rides = np.random.randint(5, 15)
        # Standard daytime
        else:
            base_rides = np.random.randint(20, 40)
            
        # 2. Add Contextual Multipliers
        # Weekend nights are busier
        if is_weekend and (hour >= 20 or hour <= 2):
            base_rides += 25
            
        # 3. Previous Day Lag (for the 'contextual' part of your model)
        # For the first day, we'll just use a random start
        prev_day_count = data[len(data)-24]['ride_count'] if len(data) >= 24 else np.random.randint(20, 40)

        data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'hour': hour,
            'day_of_week': day_of_week,
            'is_weekend': is_weekend,
            'prev_day_ride_count': prev_day_count,
            'ride_count': base_rides
        })

# Create DataFrame and Save
df = pd.DataFrame(data)
df.to_csv('ride_data.csv', index=False)
print("File 'ride_data.csv' has been generated successfully!")