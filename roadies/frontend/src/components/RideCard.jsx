import React, { useState, useEffect } from 'react';
import { faresAPI } from '../services/api';

function RideCard({ ride, isSelected, onSelect }) {
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFare = async () => {
      try {
        const hour = new Date().getHours();
        const response = await faresAPI.calculate(ride.app, ride.type, ride.dist, hour);
        setFare(response.data);
      } catch (error) {
        console.error('Error calculating fare:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFare();
  }, [ride]);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-3 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!fare) return null;

  const surgeColor =
    fare.surge <= 1.05 ? 'text-green-600' :
    fare.surge <= 1.4 ? 'text-amber-600' : 'text-red-600';

  const surgeBg =
    fare.surge <= 1.05 ? 'bg-green-100' :
    fare.surge <= 1.4 ? 'bg-amber-100' : 'bg-red-100';

  const appColors = {
    uber: 'bg-ink text-white',
    ola: 'bg-green-100 text-green-700 border border-green-300',
    rapido: 'bg-amber-100 text-amber-700 border border-amber-300'
  };

  const appButtonColors = {
    uber: 'bg-ink hover:bg-gray-900',
    ola: 'bg-green-600 hover:bg-green-700',
    rapido: 'bg-amber-600 hover:bg-amber-700'
  };

  return (
    <div
      onClick={onSelect}
      className={`border-2 rounded-2xl p-3 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-border hover:border-gray-400'
      }`}
    >
      {/* Top Section */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${appColors[ride.app]}`}>
          {ride.logo}
        </div>
        <div className="flex-1">
          <div className="font-bold text-base text-ink">{ride.name}</div>
          <div className="text-xs text-muted">
            {ride.seats} seat{ride.seats > 1 ? 's' : ''} • ★ {ride.rating} • {ride.dist}km away
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-ink">₹{fare.total}</div>
          <div className="text-xs text-muted">₹{fare.low}–{fare.high}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-xs text-muted font-semibold uppercase tracking-wider">ETA</div>
          <div className="text-sm font-bold text-green-600">{fare.mins}m</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-xs text-muted font-semibold uppercase tracking-wider">Per km</div>
          <div className="text-sm font-bold text-ink">₹{Math.round(fare.total / ride.dist)}</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-xs text-muted font-semibold uppercase tracking-wider">Surge</div>
          <div className={`text-sm font-bold ${surgeColor}`}>{fare.surge}x</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-2 text-center">
          <div className="text-xs text-muted font-semibold uppercase tracking-wider">Base</div>
          <div className="text-sm font-bold text-ink">₹{fare.base}</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
        <span className="bg-gray-100 text-muted rounded px-2 py-1">Base ₹{fare.base}</span>
        <span className="bg-gray-100 text-muted rounded px-2 py-1">+Dist ₹{fare.distCharge}</span>
        <span className="bg-gray-100 text-muted rounded px-2 py-1">+Time ₹{fare.timeCharge}</span>
        <span className={`${surgeBg} ${surgeColor} rounded px-2 py-1 font-bold`}>
          {fare.surge > 1.05 ? `▲ ${fare.surge}x` : 'No surge'}
        </span>
        <span className="bg-ink text-white rounded px-2 py-1 font-bold">= ₹{fare.total}</span>
      </div>

      {/* Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          alert(`Opening ${ride.app.charAt(0).toUpperCase() + ride.app.slice(1)} — predicted ₹${fare.total}`);
        }}
        className={`w-full text-white font-bold py-3 rounded-lg text-sm transition-all ${appButtonColors[ride.app]}`}
      >
        Open in {ride.app.charAt(0).toUpperCase() + ride.app.slice(1)} →
      </button>
    </div>
  );
}

export default RideCard;