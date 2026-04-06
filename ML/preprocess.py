import pandas as pd
import numpy as np

def load_data(path):
    df = pd.read_csv(path)
    return df

def create_sequences(data, window=3):
    X, y = [], []
    
    values = data['demand'].values
    
    for i in range(window, len(values)):
        X.append(values[i-window:i])
        y.append(values[i])
    
    X = np.array(X)
    y = np.array(y)
    
    return X, y
