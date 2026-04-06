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
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}`
        );
        const data = await response.json();

        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || 'Unknown';
          const state = data.address.state || '';
          setLocationName(`${city}, ${state}`.substring(0, 25));
        } else {
          setLocationName('Current Location');
        }
      } catch (error) {
        console.log('Using default location');
        setLocationName('Current Location');
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
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-black font-bold text-lg px-3 py-2 rounded-lg flex items-center gap-2 min-w-max">
            {/* Arrow Icon */}
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {/* Logo Text */}
            <span className="tracking-tight">Roadies</span>
          </div>
        </div>

        {/* Center: Time & Location & Surge */}
        <div className="flex items-center gap-6 text-sm">
          {/* Time */}
          <div className="flex items-center gap-2 text-gray-700 font-medium whitespace-nowrap">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{currentTime}</span>
          </div>

          {/* Surge Multiplier */}
          <div
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-1.5 whitespace-nowrap ${
              surgeMultiplier > 1.5
                ? 'bg-red-50 text-red-700 border border-red-200'
                : surgeMultiplier > 1.2
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            <span className="font-bold">{surgeMultiplier}x</span>
            <span>Demand</span>
          </div>

          {/* Live Location (Source) */}
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap">
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">Live</span>
            </div>
            <span className="text-xs font-semibold text-gray-800 max-w-[150px] truncate">
              {loading ? 'Locating...' : locationName}
            </span>
          </div>
        </div>

        {/* Right: Profile Button */}
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm hover:bg-gray-800 transition border border-gray-800 flex-shrink-0"
          title="Open Profile"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </button>
      </div>
    </div>
  );
}

export default TopBar;