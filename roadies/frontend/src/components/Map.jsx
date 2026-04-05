import React, { useEffect, useRef, useContext, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SearchAutocomplete from './SearchAutocomplete';
import { AppContext } from '../context/AppContext';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Map() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeLineRef = useRef(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const context = useContext(AppContext);
  
  if (!context) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading map...</div>;
  }

  const { 
    userLocation = [27.1767, 78.0081], 
    destination,
    setDestination = () => {},
    setDestinationName = () => {},
    rides = [],
    loading = false,
  } = context;

  // Initialize map ONCE
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    console.log('🗺️ Initializing map at:', userLocation);

    const map = L.map(mapRef.current, {
      center: userLocation,
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    console.log('✅ Map created');

    // Handle clicks to set destination
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`📍 Clicked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      
      setDestination([lat, lng]);
      setDestinationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setShowInstructions(false);
    });

    return () => {
      // Keep map alive
    };
  }, []);

  // Update user location marker and center map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove old user marker
    if (markersRef.current.user) {
      map.removeLayer(markersRef.current.user);
    }

    // Add user location marker (blue dot)
    const userMarker = L.circleMarker(userLocation, {
      radius: 12,
      fillColor: '#3b82f6',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1,
    })
      .bindPopup('📍 Your Location')
      .addTo(map);

    markersRef.current.user = userMarker;

    // Center map on user
    map.setView(userLocation, 15);

    console.log('✅ User location updated:', userLocation);
  }, [userLocation]);

  // Update destination marker and draw route
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove old destination marker
    if (markersRef.current.destination) {
      map.removeLayer(markersRef.current.destination);
    }

    // Remove old route line
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // If destination is set, add marker and draw route
    if (destination && destination.length === 2) {
      // Add destination marker (red dot)
      const destMarker = L.circleMarker(destination, {
        radius: 12,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      })
        .bindPopup('📍 Destination')
        .addTo(map);

      markersRef.current.destination = destMarker;

      // Draw route line from source to destination
      routeLineRef.current = L.polyline([userLocation, destination], {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 5',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Fit both markers in view with padding
      const group = L.featureGroup([destMarker, markersRef.current.user]);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });

      console.log('✅ Route drawn from source to destination');
    }
  }, [destination, userLocation]);

  // Update ride markers
  useEffect(() => {
    if (!mapInstanceRef.current || !rides || rides.length === 0) return;

    const map = mapInstanceRef.current;

    // Remove old ride markers
    Object.keys(markersRef.current).forEach((key) => {
      if (key.startsWith('ride-')) {
        map.removeLayer(markersRef.current[key]);
        delete markersRef.current[key];
      }
    });

    // Colors for different apps
    const colors = {
      uber: '#0c0c10',
      ola: '#16a34a',
      rapido: '#d97706',
    };

    // Add new ride markers
    rides.forEach((ride) => {
      if (!ride.lat || !ride.lng) return;

      const marker = L.circleMarker([ride.lat, ride.lng], {
        radius: 10,
        fillColor: colors[ride.app] || '#666',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9,
      })
        .bindPopup(
          `<div style="font-weight: bold;">
            ${ride.name}<br/>
            ⭐ ${ride.rating}<br/>
            📍 ${ride.dist}km<br/>
            ₹${ride.price}
          </div>`
        )
        .addTo(map);

      markersRef.current[`ride-${ride.id}`] = marker;
    });

    console.log(`✅ Added ${rides.length} ride markers`);
  }, [rides]);

  return (
    <div className="absolute inset-0 z-10">
      <div ref={mapRef} className="w-full h-full" style={{ background: '#e5e3df' }} />

      {/* Loading Status */}
      {loading && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
            📍 Loading rides...
          </div>
        </div>
      )}

      {/* Destination Set Status */}
      {destination && (
        <div className="absolute top-16 right-4 z-40">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg">
            ✓ Route Ready<br />Scroll down to book
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
        <SearchAutocomplete
          onSelectDestination={(location) => {
            if (location && location.lat && location.lng) {
              setDestination([location.lat, location.lng]);
              setDestinationName(location.name || 'Selected Location');
              setShowInstructions(false);
              console.log('🔍 Search selected:', location.name);
            }
          }}
        />
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="absolute bottom-96 left-4 z-40 bg-white rounded-lg p-3 shadow-lg text-xs font-semibold text-gray-700 max-w-xs">
          <p className="mb-2">💡 Quick Guide:</p>
          <p>✓ Click on map to set destination</p>
          <p>✓ Or use search bar above</p>
          <p>✓ Route line will appear</p>
          <p>✓ Scroll down to see rides</p>
        </div>
      )}

      {/* Zoom/Drag Info */}
      <div className="absolute bottom-80 right-4 z-40 bg-white rounded-lg p-2 shadow-lg text-xs text-gray-600">
        <p>🔍 Scroll to zoom</p>
        <p>👆 Drag to move</p>
      </div>

      {/* Route Info */}
      {destination && (
        <div className="absolute top-20 left-4 z-40 bg-white rounded-lg p-3 shadow-lg">
          <p className="font-bold text-sm text-gray-900 mb-2">📍 Route Details</p>
          <div className="text-xs text-gray-700 space-y-1">
            <p><span className="font-semibold">From:</span> Your Location</p>
            <p><span className="font-semibold">To:</span> Destination Set</p>
            <p className="text-green-600 font-semibold">✅ Route displayed on map</p>
          </div>
        </div>
      )}

      {/* Rides Count */}
      {!destination && (
        <div className="absolute top-20 left-4 z-40 bg-white rounded-lg p-3 shadow-lg">
          <p className="font-bold text-sm text-gray-900">
            📍 {rides.length} Rides Available
          </p>
          <p className="text-xs text-gray-500">Click map to set destination</p>
        </div>
      )}
    </div>
  );
}

export default Map;