import tensorflowjs as tfjs
import tensorflow as tf
import os

# 1. Load the model you already trained
# Change 'ride_model.h5' to whatever your filename is
model_path = 'ride_model.h5' 

if os.path.exists(model_path):
    model = tf.keras.models.load_model(model_path) 

    # 2. Convert and save it for the web
    # This bypasses the broken terminal command and goes straight to the source
    tfjs.converters.save_keras_model(model, 'web_model')
    print("✅ Success! Your model files are now in the 'web_model' folder.")
else:
    print(f"❌ Error: Could not find {model_path}. Check your filename!")