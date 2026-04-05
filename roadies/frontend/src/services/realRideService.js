// Real Ride Service - Fetches and manages rides from multiple apps

const realRideService = {
  // Fetch REAL nearby rides from multiple apps
  getNearbyRides: async (lat, lng, radius = 5) => {
    try {
      console.log(`🚗 Fetching real rides near ${lat}, ${lng}`);

      // Call your backend API
      const response = await fetch(
        `http://localhost:5000/api/rides/nearby?lat=${lat}&lng=${lng}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }

      const rides = await response.json();
      console.log('✅ Rides fetched:', rides);
      
      // Sort by distance (nearest first)
      return rides.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    } catch (error) {
      console.error('❌ Error fetching real rides:', error);
      return [];
    }
  },

  // Open the actual ride booking app
  openRideApp: (ride) => {
    let appUrl = '';

    if (ride.app.toLowerCase() === 'uber') {
      // Uber deep link for booking
      appUrl = `uber://?action=setPickupLocation&pickup[latitude]=${ride.userLat || 27.1767}&pickup[longitude]=${ride.userLng || 78.0081}&dropoff[latitude]=${ride.dropLat || ride.lat}&dropoff[longitude]=${ride.dropLng || ride.lng}`;

      // Fallback to web if app not installed
      setTimeout(() => {
        window.location.href = `https://m.uber.com/looking?dropoff[latitude]=${ride.dropLat || ride.lat}&dropoff[longitude]=${ride.dropLng || ride.lng}`;
      }, 500);
    } else if (ride.app.toLowerCase() === 'ola') {
      // Ola deep link
      appUrl = `ola://book?pickup_latitude=${ride.userLat || 27.1767}&pickup_longitude=${ride.userLng || 78.0081}&dropoff_latitude=${ride.dropLat || ride.lat}&dropoff_longitude=${ride.dropLng || ride.lng}`;

      // Fallback to web
      setTimeout(() => {
        window.location.href = `https://olarides.com/?pickup=${ride.userLat || 27.1767},${ride.userLng || 78.0081}&dropoff=${ride.dropLat || ride.lat},${ride.dropLng || ride.lng}`;
      }, 500);
    } else if (ride.app.toLowerCase() === 'rapido') {
      // Rapido deep link
      appUrl = `rapido://book?lat=${ride.userLat || 27.1767}&lng=${ride.userLng || 78.0081}`;

      // Fallback to web
      setTimeout(() => {
        window.location.href = `https://rapido.app/ride?lat=${ride.userLat || 27.1767}&lng=${ride.userLng || 78.0081}`;
      }, 500);
    }

    // Try to open app first (if installed)
    if (appUrl) {
      window.location.href = appUrl;
    }
  },

  // Calculate distance between two coordinates (in km)
  calculateDistance: (lat1, lng1, lat2, lng2) => {
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
  },
};

export default realRideService;