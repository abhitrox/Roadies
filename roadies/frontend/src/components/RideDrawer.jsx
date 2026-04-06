import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import PriceBreakdown from './PriceBreakdown';
import realRideService from '../services/realRideService';

function RideDrawer() {
  const {
    userLocation,
    destination,
    destinationName,
    estimatedFares,
    faresLoading,
    rides,
    loading,
    setDestination,
    setDestinationName,
  } = useContext(AppContext) || {
    userLocation: [27.1767, 78.0081],
    destination: null,
    destinationName: '',
    estimatedFares: [],
    faresLoading: false,
    rides: [],
    loading: false,
    setDestination: () => {},
    setDestinationName: () => {},
  };

  const [activeTab, setActiveTab] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [sourceName, setSourceName] = useState('Getting location...');
  const [sourceCity, setSourceCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [predictedRides, setPredictedRides] = useState([]);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [editingDestination, setEditingDestination] = useState(false);
  const [destinationInput, setDestinationInput] = useState('');
  const [demandLevel, setDemandLevel] = useState('normal');
  const [sameCity, setSameCity] = useState(false);
  const drawerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const isDraggingRef = useRef(false);

  const ridesToDisplay = predictedRides.length > 0 ? predictedRides : rides;

  // Get city name from coordinates
  const getCityFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const city = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.county || 
                    'Unknown';
        const state = data.address.state || '';
        return { city, state, fullAddress: data.display_name };
      }
      return { city: 'Unknown', state: '', fullAddress: '' };
    } catch (error) {
      console.error('Error getting city:', error);
      return { city: 'Unknown', state: '', fullAddress: '' };
    }
  };

  // Get source location name from live coordinates
  useEffect(() => {
    const fetchSourceName = async () => {
      try {
        const { city, state, fullAddress } = await getCityFromCoordinates(
          userLocation[0],
          userLocation[1]
        );
        
        setSourceCity(city);
        setSourceName(`${city}${state ? ', ' + state : ''}`);
        console.log('📍 Source City:', city);
      } catch (error) {
        console.log('Using default source');
        setSourceName('Your Location');
        setSourceCity('Unknown');
      }
    };

    fetchSourceName();
  }, [userLocation]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get demand level multiplier
  const getDemandMultiplier = () => {
    const hour = new Date().getHours();
    
    if ((hour >= 7 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 20)) {
      setDemandLevel('high');
      return 1.3;
    }
    else if ((hour >= 10 && hour <= 12) || (hour >= 14 && hour <= 17) || (hour >= 20 && hour <= 22)) {
      setDemandLevel('medium');
      return 1.15;
    }
    else {
      setDemandLevel('normal');
      return 1.0;
    }
  };

  // Calculate price range
  const calculatePriceRange = (basePrice, distance) => {
    const demandMultiplier = getDemandMultiplier();
    const basePrediction = Math.round(basePrice * (1 + distance * 0.5));
    const minPrice = Math.round(basePrediction * 0.85);
    const maxPrice = Math.round(basePrediction * demandMultiplier * 1.2);
    const currentPrice = Math.round(basePrediction * demandMultiplier);
    
    return {
      min: minPrice,
      current: currentPrice,
      max: maxPrice,
      demandMultiplier: demandMultiplier,
    };
  };

  // Search for location by name
  const searchLocation = async (query) => {
    if (!query || query.length < 3) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const firstResult = results[0];
        const lat = parseFloat(firstResult.lat);
        const lng = parseFloat(firstResult.lon);
        const name = firstResult.display_name.split(',')[0];

        console.log(`📍 Location found: ${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

        setDestination([lat, lng]);
        setDestinationName(name);
        setEditingDestination(false);
        setDestinationInput('');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // ML Price Prediction when destination changes
  useEffect(() => {
    if (!destination) {
      setPredictedRides([]);
      setDistanceInfo(null);
      setDestCity('');
      setSameCity(false);
      return;
    }

    const predictPrices = async () => {
      try {
        console.log('🤖 ML predicting prices from source to destination...');
        console.log('Source (From):', userLocation);
        console.log('Destination (To):', destination);

        // Get destination city
        const { city: destCityName } = await getCityFromCoordinates(
          destination[0],
          destination[1]
        );
        
        setDestCity(destCityName);
        console.log('🏙️ Source City:', sourceCity);
        console.log('🏙️ Destination City:', destCityName);

        // Check if same city
        const isSameCity = sourceCity.toLowerCase() === destCityName.toLowerCase();
        setSameCity(isSameCity);

        if (!isSameCity) {
          console.log('⚠️ Different cities - Not showing rides');
          setPredictedRides([]);
          setDistanceInfo(null);
          return;
        }

        // Calculate distance between source and destination
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          destination[0],
          destination[1]
        );

        setDistanceInfo({
          distance: distance,
          from: userLocation,
          to: destination,
        });

        console.log(`📏 Distance calculated: ${distance.toFixed(2)}km`);

        // Only proceed if same city AND distance is reasonable (max 50km for rides)
        if (distance > 50) {
          console.log('⚠️ Distance too far - Not showing rides');
          setPredictedRides([]);
          return;
        }

        // Call ML backend for price prediction
        const mlUrl = `http://localhost:5000/api/rides/predict-price?` +
          `fromLat=${userLocation[0]}&fromLng=${userLocation[1]}&` +
          `toLat=${destination[0]}&toLng=${destination[1]}&` +
          `distance=${distance.toFixed(2)}`;

        console.log('🔗 ML API URL:', mlUrl);

        const response = await fetch(mlUrl);
        const data = await response.json();
        
        console.log('💰 ML Response:', data);

        // Update rides with ML predicted prices
        if (data.predictions && Array.isArray(data.predictions)) {
          console.log('✅ Using ML predictions from backend');
          
          const updatedRides = rides.map((ride) => {
            const prediction = data.predictions.find((p) => p.type === ride.type);
            const basePrice = prediction ? prediction.price : ride.price;
            const priceRange = calculatePriceRange(basePrice, distance);
            
            console.log(`Ride: ${ride.name} (${ride.type}) - Price Range: ₹${priceRange.min} - ₹${priceRange.max}`);
            
            return {
              ...ride,
              price: priceRange.current,
              priceRange: priceRange,
              mlPredicted: true,
              distance: distance,
            };
          });

          setPredictedRides(updatedRides);
        } else {
          // Fallback: Simple ML calculation (distance-based)
          console.log('⚠️ Backend response missing predictions, using fallback calculation');
          
          const basePrices = {
            bike: 20,
            auto: 50,
            cab: 100,
          };

          const updatedRides = rides.map((ride) => {
            const basePrice = Math.round(
              (basePrices[ride.type] || 100) * (1 + distance * 0.5)
            );
            const priceRange = calculatePriceRange(basePrice, distance);
            
            console.log(`Ride: ${ride.name} (${ride.type}) - Fallback Price Range: ₹${priceRange.min} - ₹${priceRange.max}`);
            
            return {
              ...ride,
              price: priceRange.current,
              priceRange: priceRange,
              mlPredicted: false,
              distance: distance,
            };
          });

          setPredictedRides(updatedRides);
        }
      } catch (error) {
        console.error('❌ ML Prediction error:', error);
        
        const updatedRides = rides.map((ride) => ({
          ...ride,
          mlPredicted: false,
        }));
        
        setPredictedRides(updatedRides);
      }
    };

    predictPrices();
  }, [destination, userLocation, rides, sourceCity]);

  const filterRides = (type) => {
    if (type === 'all') return ridesToDisplay;
    return ridesToDisplay.filter((ride) => ride.type === type);
  };

  const filteredRides = filterRides(activeTab);

  const handleBookRide = async (ride) => {
    setBookingInProgress(true);
    try {
      console.log('📱 Booking', ride.app, 'ride:', ride.name);
      console.log('Route: From', sourceName, 'To', destinationName);
      console.log('Distance:', distanceInfo?.distance.toFixed(2), 'km');
      console.log('Price Range: ₹', ride.priceRange?.min, '-', ride.priceRange?.max);
      console.log('Current Price: ₹', ride.price);
      
      realRideService.openRideApp(ride);
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride');
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = isExpanded ? window.innerHeight : 288;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.touches[0].clientY;
    startHeightRef.current = isExpanded ? window.innerHeight : 288;
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const diff = startYRef.current - e.clientY;
    const newHeight = startHeightRef.current + diff;
    const maxHeight = window.innerHeight - 100;
    const minHeight = 200;

    if (drawerRef.current) {
      const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      drawerRef.current.style.maxHeight = clampedHeight + 'px';
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;

    const diff = startYRef.current - e.touches[0].clientY;
    const newHeight = startHeightRef.current + diff;
    const maxHeight = window.innerHeight - 100;
    const minHeight = 200;

    if (drawerRef.current) {
      const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      drawerRef.current.style.maxHeight = clampedHeight + 'px';
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    snapToPosition();
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    snapToPosition();
  };

  const snapToPosition = () => {
    if (drawerRef.current) {
      const currentHeight = drawerRef.current.offsetHeight;
      const screenHeight = window.innerHeight;
      const threshold = screenHeight * 0.5;

      if (currentHeight > threshold) {
        setIsExpanded(true);
        drawerRef.current.style.maxHeight = (screenHeight - 100) + 'px';
      } else {
        setIsExpanded(false);
        drawerRef.current.style.maxHeight = '288px';
      }
    }
  };

  const handleScroll = (e) => {
    if (!isExpanded) return;
  };

  const handleWheel = (e) => {
    if (!isExpanded || isDraggingRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer.scrollTop <= 5 && e.deltaY > 0) {
      e.preventDefault();
      setIsExpanded(false);
      drawerRef.current.style.maxHeight = '288px';
    }
  };

  const handleClearDestination = () => {
    setDestination(null);
    setDestinationName('');
    setEditingDestination(false);
    setDestinationInput('');
  };

  const handleDestinationClick = () => {
    setEditingDestination(true);
    setDestinationInput(destinationName);
  };

  const getDemandBadge = () => {
    const badges = {
      normal: { label: 'Normal', color: 'bg-green-100 text-green-700', icon: '✅' },
      medium: { label: 'Medium Demand', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
      high: { label: 'High Demand', color: 'bg-red-100 text-red-700', icon: '🔴' },
    };
    return badges[demandLevel];
  };

  return (
    <>
      {/* Price Breakdown Modal */}
      {showBreakdown && selectedRide && (
        <PriceBreakdown ride={selectedRide} onClose={() => setShowBreakdown(false)} />
      )}

      {/* Main Drawer */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 transition-all duration-300 overflow-hidden flex flex-col"
        style={{
          maxHeight: isExpanded ? 'calc(100vh - 100px)' : '288px',
          transitionProperty: isDraggingRef.current ? 'none' : 'max-height',
        }}
      >
        {/* Drag Handle & Header */}
        <div
          className="bg-gradient-to-r from-white to-gray-50 rounded-t-3xl pt-3 pb-4 px-4 border-b border-gray-200 sticky top-0 z-10 select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            cursor: isDraggingRef.current ? 'grabbing' : 'ns-resize',
          }}
        >
          {/* Bidirectional Arrow Indicator */}
          <div className="flex flex-col items-center gap-2 mb-3">
            <svg 
              width="20" 
              height="24" 
              viewBox="0 0 20 24" 
              className="text-gray-400"
              style={{
                animation: 'bounce 2s infinite',
              }}
            >
              <style>{`
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(4px); }
                }
              `}</style>
              <path 
                d="M10 2 L15 8 L13 8 L13 10 L7 10 L7 8 L5 8 Z" 
                fill="currentColor"
              />
              <path 
                d="M10 22 L5 16 L7 16 L7 14 L13 14 L13 16 L15 16 Z" 
                fill="currentColor"
              />
            </svg>
            <div className="w-12 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
          </div>

          {/* Source & Destination Panel */}
          <div className="bg-white border border-gray-300 rounded-xl p-3 mb-3">
            {/* Source Field */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="w-0.5 h-6 bg-gray-300"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-semibold">From</p>
                <p className="text-sm font-bold text-gray-900 truncate">{sourceName}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-lg">
                📍
              </button>
            </div>

            {/* Destination Field - EDITABLE */}
            <div className="pt-3">
              {editingDestination ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchLocation(destinationInput);
                      }
                    }}
                    placeholder="Search destination..."
                    className="flex-1 px-2 py-1 border border-blue-400 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setEditingDestination(false);
                      setDestinationInput('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div 
                  onClick={handleDestinationClick}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold">To</p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {destination ? destinationName : 'Set destination'}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearDestination();
                    }}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    {destination ? '✕' : '📍'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Distance & Demand Info / City Check */}
          {destination && !sameCity ? (
            <div className="text-xs font-semibold flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-700">
                Different cities - Only available within same city
              </span>
            </div>
          ) : destination && distanceInfo ? (
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs font-semibold flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-gray-700">{distanceInfo.distance.toFixed(1)}km</span>
              </div>
              <div className={`text-xs font-semibold px-2 py-1 rounded ${getDemandBadge().color}`}>
                {getDemandBadge().icon} {getDemandBadge().label}
              </div>
            </div>
          ) : destination ? (
            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 animate-pulse">
              <span>⏳</span> Checking city...
            </div>
          ) : (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>👆</span> Click "To" field or map to set destination
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={handleScroll}
          onWheel={handleWheel}
        >
          {/* Ride Type Tabs */}
          <div className="bg-white border-b flex gap-2 px-4 py-3 overflow-x-auto sticky top-0 z-10">
            {['All', 'Bike', 'Auto', 'Cab'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type.toLowerCase())}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                  activeTab === type.toLowerCase()
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Rides List */}
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-semibold">Fetching real-time rides...</p>
            </div>
          ) : !destination ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 font-bold text-lg mb-2">📍 Select a Destination</p>
              <p className="text-gray-500 text-sm">
                Click the "To" field above or click on the map to set your destination in {sourceCity}.
              </p>
            </div>
          ) : !sameCity ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 font-bold text-lg mb-2">🚫 Different City</p>
              <p className="text-gray-500 text-sm mb-2">
                Rides are only available within <span className="font-semibold">{sourceCity}</span>
              </p>
              <p className="text-xs text-gray-400">
                You selected destination in <span className="font-semibold">{destCity}</span>
              </p>
            </div>
          ) : faresLoading || predictedRides.length === 0 && destination ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-semibold">🤖 ML calculating price ranges for {distanceInfo?.distance.toFixed(1)}km...</p>
            </div>
          ) : filteredRides.length > 0 ? (
            <div className="divide-y">
              {filteredRides.map((ride, index) => (
                <div
                  key={`${ride.app}-${ride.id}-${index}`}
                  className="p-4 hover:bg-blue-50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold text-center flex-shrink-0"
                        style={{
                          backgroundColor:
                            ride.app === 'uber'
                              ? '#0c0c10'
                              : ride.app === 'ola'
                              ? '#16a34a'
                              : '#d97706',
                        }}
                      >
                        {ride.app === 'uber' ? 'Ⓤ' : ride.app === 'ola' ? 'Ⓞ' : 'Ⓡ'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{ride.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{ride.app}</p>
                      </div>
                    </div>

                    {/* Price Range Display */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        {ride.priceRange ? (
                          <>
                            <p className="font-bold text-blue-600 text-sm">
                              ₹{ride.priceRange.min}-{ride.priceRange.max}
                            </p>
                            <p className="text-xs text-gray-500">
                              now: ₹{ride.priceRange.current}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-blue-600 text-lg">₹{ride.price}</p>
                            <p className="text-xs text-gray-500">Estimated</p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBreakdown(true);
                          setSelectedRide(ride);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-bold text-sm whitespace-nowrap flex-shrink-0"
                      >
                        💡
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-600 mb-3">
                    <span>⭐ {ride.rating}</span>
                    <span>📍 {ride.distance?.toFixed(1) || ride.dist}km</span>
                    <span>⏱️ ~{ride.eta} min</span>
                  </div>

                  {/* Price Info */}
                  {ride.priceRange && (
                    <div className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-700 mb-2 font-semibold">
                      💰 Price varies: ₹{ride.priceRange.min} (off-peak) to ₹{ride.priceRange.max} (peak hours)
                    </div>
                  )}

                  <button
                    onClick={() => handleBookRide(ride)}
                    disabled={bookingInProgress}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 active:scale-95"
                  >
                    {bookingInProgress ? '⏳ Opening app...' : `✓ Book ${ride.app.toUpperCase()}`}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 font-semibold">No rides available</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different location or ride type
              </p>
            </div>
          )}

          <div className="h-8" />
        </div>
      </div>

      {!isExpanded && rides.length > 0 && (
        <div className="fixed bottom-80 left-1/2 transform -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="text-blue-600 text-sm font-semibold bg-white px-4 py-2 rounded-full shadow-lg">
            ✅ {rides.length} rides available • 👆 Drag up to book
          </p>
        </div>
      )}
    </>
  );
}

export default RideDrawer;