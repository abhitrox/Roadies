import React, { useState, useEffect } from 'react';

function TopBar({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState('');
  const [surge, setSurge] = useState('1.0x');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ap = hours < 12 ? 'AM' : 'PM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setCurrentTime(`${displayHours}:${String(minutes).padStart(2, '0')} ${ap}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-14 bg-white border-b border-border flex items-center justify-between px-5 z-100 flex-shrink-0">
      <div className="flex items-center gap-2 text-base font-black text-ink">
        <div className="w-7 h-7 bg-ink rounded flex items-center justify-center text-white text-lg">
          →
        </div>
        Roadies
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold text-muted bg-pill px-3 py-1 rounded">
          {currentTime || '--'}
        </div>
        <div className="flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-bold">
          <span className="w-1 h-1 rounded-full bg-green-700"></span>
          {surge} surge
        </div>
        <div className="flex items-center gap-2 bg-pill rounded-full px-3 py-1 text-xs font-medium text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Agra, UP
        </div>
        <button
          onClick={onLogout}
          className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
          title="Logout"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </button>
      </div>
    </div>
  );
}

export default TopBar;