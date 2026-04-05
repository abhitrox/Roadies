import React, { useState } from 'react';

function PriceBreakdown({ ride, onClose }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/rides/price-breakdown/${ride.id}?` +
            `lat=27.1767&lng=78.0081&destLat=${ride.lat}&destLng=${ride.lng}&rideType=${ride.type}`
        );
        const data = await response.json();
        setBreakdown(data);
      } catch (error) {
        console.error('Error fetching breakdown:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdown();
  }, [ride]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!breakdown) return <div className="p-4">Error loading breakdown</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">💰 Price Breakdown</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Total Price */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl border-2 border-green-200">
            <p className="text-gray-600 text-sm">Estimated Fare</p>
            <p className="text-4xl font-bold text-green-600">
              ₹{breakdown.prediction.estimatedPrice}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              🤖 ML Predicted ({breakdown.prediction.confidence * 100}% confidence)
            </p>
          </div>

          {/* Ride Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Distance</span>
              <span className="font-semibold">{breakdown.prediction.distance} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Time</span>
              <span className="font-semibold">{breakdown.prediction.estimatedTime} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ride Type</span>
              <span className="font-semibold capitalize">{breakdown.prediction.rideType}</span>
            </div>
          </div>

          {/* Price Components */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-gray-900 mb-3">Price Factors</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>📍 Base Fare</span>
                <span className="font-semibold">
                  ₹{Math.round(breakdown.prediction.breakdown.basePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>📏 Distance Charge</span>
                <span className="font-semibold">
                  ₹{Math.round(breakdown.prediction.breakdown.distanceCharge)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>⏱️ Time Charge</span>
                <span className="font-semibold">
                  ₹{Math.round(breakdown.prediction.breakdown.timeCharge)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>🚗 Traffic Charge</span>
                <span className="font-semibold">
                  ₹{Math.round(breakdown.prediction.breakdown.trafficCharge)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>👥 Demand Charge</span>
                <span className="font-semibold">
                  ₹{Math.round(breakdown.prediction.breakdown.demandCharge)}
                </span>
              </div>
            </div>
          </div>

          {/* Multipliers */}
          <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-gray-900 mb-3">Adjustments</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>🕐 Peak Hour</span>
                <span className="font-semibold text-blue-600">
                  {breakdown.prediction.breakdown.timeMultiplier}
                </span>
              </div>
              <div className="flex justify-between">
                <span>📅 Day Type</span>
                <span className="font-semibold text-blue-600">
                  {breakdown.prediction.breakdown.dayMultiplier}
                </span>
              </div>
              <div className="flex justify-between">
                <span>🌧️ Weather</span>
                <span className="font-semibold text-blue-600">
                  {breakdown.prediction.breakdown.weatherMultiplier}
                </span>
              </div>
              <div className="flex justify-between">
                <span>📈 Demand</span>
                <span className="font-semibold text-blue-600">
                  {breakdown.prediction.breakdown.demandMultiplier}
                </span>
              </div>
            </div>
          </div>

          {/* ML Info */}
          <div className="bg-purple-50 rounded-2xl p-3 text-xs text-gray-600">
            <p>
              🤖 <strong>AI Pricing:</strong> This price is predicted using machine learning based on
              distance, time, traffic, demand, time of day, and weather conditions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceBreakdown;