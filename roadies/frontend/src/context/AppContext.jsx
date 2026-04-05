import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  const [rides, setRides] = useState([
    { id: 1, app: 'uber', name: 'Uber Go', type: 'cab', dist: 0.8, rating: 4.3, price: 150, lat: 27.1800, lng: 78.0100, eta: 5 },
    { id: 2, app: 'ola', name: 'Ola Mini', type: 'cab', dist: 1.2, rating: 4.1, price: 145, lat: 27.1750, lng: 78.0050, eta: 6 },
    { id: 3, app: 'rapido', name: 'Rapido Bike', type: 'bike', dist: 0.5, rating: 4.5, price: 80, lat: 27.1820, lng: 78.0150, eta: 3 },
    { id: 4, app: 'uber', name: 'Uber Auto', type: 'auto', dist: 1.5, rating: 4.2, price: 200, lat: 27.1700, lng: 78.0200, eta: 7 },
    { id: 5, app: 'ola', name: 'Ola Auto', type: 'auto', dist: 1.0, rating: 4.0, price: 190, lat: 27.1850, lng: 78.0000, eta: 8 },
  ]);

  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState([27.1767, 78.0081]);
  const [destination, setDestination] = useState(null);
  const [destinationName, setDestinationName] = useState('');
  const [estimatedFares, setEstimatedFares] = useState([]);

  // Get live user location
  useEffect(() => {
    console.log('📍 Getting live location...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = [latitude, longitude];
          setUserLocation(loc);
          console.log('✅ Live location found:', loc);
        },
        (error) => {
          console.log('⚠️ Location permission denied, using default:', error.message);
          // Keep default location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, []); // Run once on mount

  // Fetch rides once
  useEffect(() => {
    console.log('🚗 Fetching nearby rides...');
    
    const controller = new AbortController();
    
    const fetchRides = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/rides/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}`,
          { signal: controller.signal }
        );
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setRides(data);
          console.log('✅ Rides loaded:', data.length);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching rides:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
    
    return () => controller.abort();
  }, [userLocation]); // Fetch when location changes

  // Set estimated fares when destination changes
  useEffect(() => {
    if (!destination) {
      setEstimatedFares([]);
      return;
    }

    console.log('💰 Destination set, calculating fares...');
    setEstimatedFares(rides);
    
  }, [destination, rides]);

  const value = {
    rides,
    loading,
    userLocation,
    setUserLocation,
    destination,
    setDestination,
    destinationName,
    setDestinationName,
    estimatedFares,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}