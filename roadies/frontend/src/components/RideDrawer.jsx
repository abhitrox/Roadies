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
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [sourceName, setSourceName] = useState('Getting location...');
  const [predictedRides, setPredictedRides] = useState([]);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [editingDestination, setEditingDestination] = useState(false);
  const [destinationInput, setDestinationInput] = useState('');
  const [demandLevel, setDemandLevel] = useState('normal');
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollContainerRef = useRef(null);

  const ridesToDisplay = predictedRides.length > 0 ? predictedRides : rides;

  // Get source location name from live coordinates
  useEffect(() => {
    const fetchSourceName = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}`
        );
        const data = await response.json();

        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || 'Your Location';
          const state = data.address.state || '';
          setSourceName(`${city}${state ? ', ' + state : ''}`);
        } else {
          setSourceName('Your Location');
        }
      } catch (error) {
        console.log('Using default source');
        setSourceName('Your Location');
      }
    };

    fetchSourceName();
  }, [userLocation]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
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

        console.log(`Location found: ${name}`);

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
      setIsWithinRange(false);
      return;
    }

    const predictPrices = async () => {
      try {
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

        const withinRange = distance <= 10;
        setIsWithinRange(withinRange);

        if (!withinRange) {
          setPredictedRides([]);
          return;
        }

        const mlUrl = `http://localhost:5000/api/rides/predict-price?` +
          `fromLat=${userLocation[0]}&fromLng=${userLocation[1]}&` +
          `toLat=${destination[0]}&toLng=${destination[1]}&` +
          `distance=${distance.toFixed(2)}`;

        const response = await fetch(mlUrl);
        const data = await response.json();

        if (data.predictions && Array.isArray(data.predictions)) {
          const updatedRides = rides.map((ride) => {
            const prediction = data.predictions.find((p) => p.type === ride.type);
            const basePrice = prediction ? prediction.price : ride.price;
            const priceRange = calculatePriceRange(basePrice, distance);
            
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
        console.error('ML Prediction error:', error);
        setPredictedRides([]);
      }
    };

    predictPrices();
  }, [destination, userLocation, rides]);

  const filterRides = (type) => {
    if (type === 'all') return ridesToDisplay;
    return ridesToDisplay.filter((ride) => ride.type === type);
  };

  const filteredRides = filterRides(activeTab);

  const handleBookRide = async (ride) => {
    setBookingInProgress(true);
    try {
      console.log('Booking', ride.app, 'ride:', ride.name);
      realRideService.openRideApp(ride);
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride');
    } finally {
      setBookingInProgress(false);
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
      normal: { label: 'Normal', color: 'bg-green-50 text-green-700 border border-green-200' },
      medium: { label: 'Medium Demand', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      high: { label: 'High Demand', color: 'bg-red-50 text-red-700 border border-red-200' },
    };
    return badges[demandLevel];
  };

  return (
    <>
      {/* Price Breakdown Modal */}
      {showBreakdown && selectedRide && (
        <PriceBreakdown ride={selectedRide} onClose={() => setShowBreakdown(false)} />
      )}

      {/* Toggle Button (when sidebar is closed) */}
      {!sidebarOpen && (
        <div className="fixed right-4 bottom-20 z-30 flex flex-col items-end gap-2">
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap">
            View Rides
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-black transition active:scale-95"
            title="View Available Rides"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      )}

      {/* Right Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen bg-white border-l border-gray-200 z-20 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '380px', maxWidth: '90vw' }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="font-semibold text-lg text-gray-900">Available Rides</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Source & Destination Panel */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="space-y-3">
            {/* Source Field */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1.5 pt-1">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                <div className="w-0.5 h-5 bg-gray-300"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">From</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{sourceName}</p>
              </div>
            </div>

            {/* Destination Field - EDITABLE */}
            {editingDestination ? (
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
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
                  placeholder="Search location..."
                  className="flex-1 px-2 py-1.5 border border-blue-400 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setEditingDestination(false);
                    setDestinationInput('');
                  }}
                  className="text-gray-400 hover:text-gray-600 px-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div 
                onClick={handleDestinationClick}
                className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition"
              >
                <div className="pt-1">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">To</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {destination ? destinationName : 'Select destination'}
                  </p>
                </div>
                {destination && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearDestination();
                    }}
                    className="text-gray-400 hover:text-red-600 transition px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Distance & Demand Info */}
          {destination && !isWithinRange ? (
            <div className="mt-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              Distance exceeds 10 km limit
            </div>
          ) : destination && distanceInfo ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-gray-700">
                {distanceInfo.distance.toFixed(1)} km
              </div>
              <div className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getDemandBadge().color}`}>
                {getDemandBadge().label}
              </div>
            </div>
          ) : destination ? (
            <div className="mt-3 text-xs text-gray-500 font-medium">
              Calculating distance...
            </div>
          ) : (
            <div className="mt-3 text-xs text-gray-500 font-medium">
              Set destination on map
            </div>
          )}
        </div>

        {/* Ride Type Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 overflow-x-auto flex-shrink-0">
          {['All', 'Bike', 'Auto', 'Cab'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type.toLowerCase())}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition ${
                activeTab === type.toLowerCase()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Scrollable Rides List */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
              </div>
              <p className="text-gray-500 font-medium text-sm mt-3">Fetching rides...</p>
            </div>
          ) : !destination ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 font-semibold text-sm mb-1">Select Destination</p>
              <p className="text-gray-500 text-xs">
                Choose a location on the map to view available rides
              </p>
            </div>
          ) : !isWithinRange ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 font-semibold text-sm mb-1">Out of Service Area</p>
              <p className="text-gray-500 text-xs mb-0.5">
                {distanceInfo?.distance.toFixed(1)} km away
              </p>
              <p className="text-gray-400 text-xs">
                Service available within 10 km
              </p>
            </div>
          ) : faresLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
              </div>
              <p className="text-gray-500 font-medium text-sm mt-3">Calculating prices...</p>
            </div>
          ) : filteredRides.length > 0 ? (
            <div className="divide-y">
              {filteredRides.map((ride, index) => (
                <div
                  key={`${ride.app}-${ride.id}-${index}`}
                  className="p-4 hover:bg-gray-50 transition border-b"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor:
                            ride.app === 'uber'
                              ? '#0c0c10'
                              : ride.app === 'ola'
                              ? '#16a34a'
                              : '#d97706',
                        }}
                      >
                        {ride.app === 'uber' ? 'U' : ride.app === 'ola' ? 'O' : 'R'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{ride.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{ride.app}</p>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="text-right flex-shrink-0 ml-3">
                      {ride.priceRange ? (
                        <>
                          <p className="font-bold text-blue-600 text-sm">
                            ₹{ride.priceRange.min}-{ride.priceRange.max}
                          </p>
                          <p className="text-xs text-gray-500">now ₹{ride.priceRange.current}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-blue-600 text-sm">₹{ride.price}</p>
                          <p className="text-xs text-gray-500">Estimated</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-600 mb-3">
                    <span className="font-medium">{ride.rating} Rating</span>
                    <span className="font-medium">{ride.distance?.toFixed(1) || ride.dist} km</span>
                    <span className="font-medium">{ride.eta} min</span>
                  </div>

                  <button
                    onClick={() => handleBookRide(ride)}
                    disabled={bookingInProgress}
                    className="w-full bg-blue-600 text-white font-semibold py-2.5 px-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 active:scale-95 text-sm"
                  >
                    {bookingInProgress ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 font-medium text-sm">No Rides Available</p>
              <p className="text-gray-400 text-xs mt-1">Try another location</p>
            </div>
          )}

          <div className="h-6" />
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default RideDrawer;