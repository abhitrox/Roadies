from preprocess import load_data, create_sequences
from model import build_model
import numpy as np

# Load data
df = load_data("data/data.csv")

zones = df['zone'].unique()

for zone in zones:
    print(f"Training for Zone {zone}...")
    
    zone_df = df[df['zone'] == zone]
    
    X, y = create_sequences(zone_df, window=3)
    
    if len(X) == 0:
        continue
    
    X = X.reshape((X.shape[0], X.shape[1], 1))
    
    model = build_model((X.shape[1], 1))
    
    model.fit(X, y, epochs=100, verbose=0)
    
    # Save model for each zone
    model.save(f"model_{zone}.h5")

print("All zone models trained!")
