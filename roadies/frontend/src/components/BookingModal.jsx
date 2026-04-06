import React, { useState } from 'react';

function BookingModal({ ride, destination, onClose, onBook }) {
  const [selectedRide, setSelectedRide] = useState(ride);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    try {
      await onBook(selectedRide);
      alert(`✅ Booked ${selectedRide.name}! Your driver is arriving.`);
      onClose();
    } catch (error) {
      alert('❌ Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!ride) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Ride Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Ride Info */}
          <div className="border-b pb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">{selectedRide.name}</p>
                <p className="text-sm text-gray-500">{selectedRide.app.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">₹{selectedRide.price}</p>
                <p className="text-xs text-gray-500">estimated fare</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span className="font-semibold">{selectedRide.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span className="font-semibold">{selectedRide.dist}km away</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⏱️</span>
                <span className="font-semibold">~5 min</span>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Driver Details</h3>
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                👤
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Raj Kumar</p>
                <p className="text-sm text-gray-500">4 years experience</p>
                <p className="text-xs text-gray-400">Vehicle: Maruti Swift • DL-01AB1234</p>
              </div>
            </div>
          </div>

          {/* Car Details */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Vehicle Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Type</p>
                <p className="font-semibold text-gray-900 capitalize">{selectedRide.type}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Seats</p>
                <p className="font-semibold text-gray-900">4 seats</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Color</p>
                <p className="font-semibold text-gray-900">White</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Number Plate</p>
                <p className="font-semibold text-gray-900">DL-01AB1234</p>
              </div>
            </div>
          </div>

          {/* Route Info */}
          {destination && (
            <div className="bg-blue-50 rounded-2xl p-4">
              <h3 className="font-bold text-gray-900 mb-2">Trip Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span>📍</span>
                  <div>
                    <p className="text-gray-500 text-xs">From</p>
                    <p className="font-semibold text-gray-900">Your Current Location</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>🎯</span>
                  <div>
                    <p className="text-gray-500 text-xs">To</p>
                    <p className="font-semibold text-gray-900">Destination ({destination[0].toFixed(2)}, {destination[1].toFixed(2)})</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <p>⚠️ <strong>Cancellation:</strong> Free till driver arrives, ₹50 after</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleBook}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? '⏳ Booking...' : '✓ Book Ride'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;