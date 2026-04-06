import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 27.1767, lng: 78.0081 });
  const [selectedRide, setSelectedRide] = useState(null);
  const [toast, setToast] = useState({ message: '', show: false });

  const showToast = (message, duration = 2800) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), duration);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      currentLocation,
      setCurrentLocation,
      selectedRide,
      setSelectedRide,
      toast,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}