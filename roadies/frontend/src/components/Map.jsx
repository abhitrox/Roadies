import React from 'react';

function Map() {
  return (
    <div className="absolute inset-0 bg-amber-100 overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" className="w-full h-full">
          {/* Horizontal Roads */}
          <line x1="0" y1="48%" x2="100%" y2="48%" stroke="#d4c9b5" strokeWidth="28" />
          <line x1="0" y1="28%" x2="100%" y2="28%" stroke="#c8bfaf" strokeWidth="16" />
          <line x1="0" y1="68%" x2="100%" y2="68%" stroke="#c8bfaf" strokeWidth="16" />
          
          {/* Vertical Roads */}
          <line x1="46%" y1="0" x2="46%" y2="100%" stroke="#d4c9b5" strokeWidth="28" />
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#c8bfaf" strokeWidth="16" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#c8bfaf" strokeWidth="16" />
        </svg>
      </div>

      {/* Parks and Buildings */}
      <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-green-200 rounded-lg opacity-70"></div>
      <div className="absolute bottom-1/3 left-1/12 w-1/6 h-1/4 bg-green-200 rounded-lg opacity-70"></div>
      <div className="absolute top-1/12 left-1/12 w-1/5 h-1/4 bg-green-200 rounded-lg opacity-70"></div>

      {/* User Location Pin */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center animate-upulse">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
        <div className="bg-white rounded-2xl border-2 border-border flex items-center gap-2 px-4 py-3 shadow-lg">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="flex-1 text-sm font-medium text-ink bg-transparent outline-none placeholder-gray-400"
          />
          <button className="bg-ink text-white text-xs font-bold rounded px-3 py-1">Go</button>
        </div>
      </div>
    </div>
  );
}

export default Map;