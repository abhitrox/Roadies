import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

function TopBar({ user, onLogout, onOpenProfile }) {
  const { userLocation } = useContext(AppContext) || {
    userLocation: [27.1767, 78.0081],
  };

  const [locationName, setLocationName] = useState('Getting location...');
  const [loading, setLoading] = useState(true);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);

  // Get location name from live coordinates
  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        // Use OpenStreetMap Nominatim API (free, no key needed)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}`
        );
        const data = await response.json();

        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || 'Unknown';
          const state = data.address.state || '';
          setLocationName(`${city}, ${state}`.substring(0, 25));
        } else {
          setLocationName('Live Location');
        }
      } catch (error) {
        console.log('Using default location');
        setLocationName('Live Location');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationName();
  }, [userLocation]);

  // Simulate surge multiplier based on demand
  useEffect(() => {
    const multipliers = [1.0, 1.2, 1.5, 2.0, 2.5];
    const randomSurge = multipliers[Math.floor(Math.random() * multipliers.length)];
    setSurgeMultiplier(randomSurge);
  }, []);

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-black text-white font-bold text-xl px-3 py-2 rounded-lg flex items-center gap-1">
            <span>→</span>
            <span>Roadies</span>
          </div>
        </div>

        {/* Center: Time & Location & Surge */}
        <div className="flex items-center gap-4 text-sm font-semibold">
          {/* Time */}
          <div className="flex items-center gap-1 text-gray-700">
            <span>🕐</span>
            <span>{currentTime}</span>
          </div>

          {/* Surge Multiplier */}
          <div
            className={`px-3 py-1 rounded-full font-bold ${
              surgeMultiplier > 1.5
                ? 'bg-red-100 text-red-600'
                : surgeMultiplier > 1.2
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-green-100 text-green-600'
            }`}
          >
            {surgeMultiplier}x surge
          </div>

          {/* Live Location (Source) */}
          <div className="flex items-center gap-1 text-gray-700 bg-blue-50 px-3 py-1 rounded-lg">
            <span className="animate-pulse text-red-500">🔴</span>
            <span className="text-xs font-semibold">
              {loading ? 'Locating...' : locationName}
            </span>
          </div>
        </div>

        {/* Right: Profile Button */}
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-800 transition"
          title="Open Profile"
        >
          {user?.name?.charAt(0).toUpperCase() || 'G'}
        </button>
      </div>
    </div>
  );
}

export default TopBar;