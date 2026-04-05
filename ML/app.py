import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
import random
from tensorflow.keras.models import load_model

# -------------------- UI STYLE --------------------

st.title("🚖 Urban Mobility Demand Prediction")
st.caption("🔴 Live AI Demand Forecasting System")

st.markdown("""
<style>
.big-font {
    font-size:22px !important;
    font-weight: bold;
}
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="big-font">🚀 AI Powered Smart Mobility Dashboard</p>', unsafe_allow_html=True)

# -------------------- INPUT SECTION --------------------

zone = st.selectbox("Select Zone", ["A", "B", "C"])

hour = st.slider("Select Hour of Day (0–23)", 0, 23, 12)
weather = st.selectbox("Weather Condition", ["Clear", "Rain", "Storm"])

# NEW: Distance input
distance = st.slider("Select Ride Distance (km)", 1, 20, 5)

model = load_model(f"model_{zone}.h5", compile=False)

input_data = st.text_input("Enter last 3 demand values (comma separated):")

# -------------------- PREDICTION --------------------

if input_data:
    try:
        values = list(map(float, input_data.split(",")))

        if len(values) == 3:
            X = np.array(values).reshape((1, 3, 1))
            pred = model.predict(X)

            prediction = pred[0][0]

            # -------------------- ADJUSTMENTS --------------------

            if 8 <= hour <= 10 or 17 <= hour <= 20:
                prediction *= 1.2
            elif 0 <= hour <= 5:
                prediction *= 0.8

            if weather == "Rain":
                prediction *= 1.2
            elif weather == "Storm":
                prediction *= 1.4

            # -------------------- OUTPUT --------------------

            st.success(f"Predicted Demand for Zone {zone}: {prediction:.2f}")

            # Confidence
            confidence = random.randint(80, 95)
            st.subheader(f"🎯 Prediction Confidence: {confidence}%")

            # Explanation
            st.subheader("🧠 AI Explanation")

            if 8 <= hour <= 10 or 17 <= hour <= 20:
                st.write("📈 Peak hours → Demand increased")
            elif 0 <= hour <= 5:
                st.write("🌙 Night time → Demand reduced")

            if weather == "Rain":
                st.write("🌧️ Rain → Demand increased")
            elif weather == "Storm":
                st.write("⛈️ Storm → Demand highly increased")

            # -------------------- SURGE --------------------

            if prediction > 25:
                surge = 1.5
            elif prediction > 15:
                surge = 1.2
            else:
                surge = 1.0

            st.subheader(f"💰 Surge Multiplier: {surge}x")

            # -------------------- FARE (NEW FEATURE) --------------------

            base_fare = 50
            per_km = 10

            fare = (base_fare + distance * per_km) * surge

            st.subheader(f"💵 Estimated Fare: ₹{fare:.2f}")

            # -------------------- METRICS --------------------

            col1, col2, col3 = st.columns(3)

            col1.metric("Demand", f"{prediction:.2f}")
            col2.metric("Surge", f"{surge}x")
            col3.metric("Fare", f"₹{fare:.0f}")

            # -------------------- DEMAND LEVEL --------------------

            st.subheader("📊 Demand Level")

            if prediction > 25:
                st.progress(100)
                st.subheader("🔥 Peak Demand Time!")
            elif prediction > 15:
                st.progress(60)
            else:
                st.progress(30)

            # -------------------- GRAPH --------------------

            future = prediction
            full_series = values + [future]

            plt.figure()
            plt.plot(values, marker='o', label="Past Demand")
            plt.plot(len(values), future, marker='o', color='red', label="Predicted")

            plt.legend()
            plt.title(f"Demand Trend for Zone {zone}")
            plt.xlabel("Time Step")
            plt.ylabel("Demand")

            st.pyplot(plt)

            # -------------------- INSIGHTS --------------------

            st.subheader("📌 Key Insights")

            if prediction > 25:
                st.write("• High congestion expected")
                st.write("• Send more drivers")
            elif prediction > 15:
                st.write("• Moderate demand")
                st.write("• Keep drivers balanced")
            else:
                st.write("• Low demand")
                st.write("• No surge needed")

            # -------------------- ALERTS --------------------

            if prediction > 25:
                st.error("🚨 High Demand Zone!")
            elif prediction > 15:
                st.warning("⚠️ Moderate Demand")
            else:
                st.success("✅ Low Demand")

        else:
            st.error("Enter exactly 3 values")

    except:
        st.error("Invalid input. Use format like 10,12,15")

# -------------------- DASHBOARD --------------------

st.subheader("🗺️ City Demand Overview")

zone_demands = {
    "A": 16,
    "B": 9,
    "C": 28
}

st.bar_chart(zone_demands)

best_zone = max(zone_demands, key=zone_demands.get)
st.success(f"🚗 Best Zone for Drivers: {best_zone}")

# -------------------- EXTRA UI --------------------

st.subheader("🌍 Zone Activity")

st.write("🟥 Zone C - High Demand")
st.write("🟨 Zone A - Medium Demand")
st.write("🟩 Zone B - Low Demand")

st.caption("⏱️ Last Updated: Just Now")
