import express from 'express';
import pricePredictor from '../ml/pricePredictor.js';

const router = express.Router();

// ✅ GET NEARBY RIDES WITH ML PREDICTED PRICES
router.get('/nearby', (req, res) => {
  const { lat, lng } = req.query;
  const userLat = lat ? parseFloat(lat) : 27.1767;
  const userLng = lng ? parseFloat(lng) : 78.0081;

  // Generate rides with ML-predicted prices
  const rides = [
    // 🚗 Uber Rides
    {
      id: 'uber-go-1',
      app: 'uber',
      name: 'Uber Go',
      type: 'cab',
      lat: userLat + (Math.random() - 0.5) * 0.01,
      lng: userLng + (Math.random() - 0.5) * 0.01,
      dist: (Math.random() * 2 + 0.3).toFixed(2),
      rating: (Math.random() * 0.5 + 4.5).toFixed(1),
      eta: Math.round(Math.random() * 3 + 2),
    },
    {
      id: 'ola-mini-1',
      app: 'ola',
      name: 'Ola Mini',
      type: 'cab',
      lat: userLat + (Math.random() - 0.5) * 0.015,
      lng: userLng + (Math.random() - 0.5) * 0.015,
      dist: (Math.random() * 2 + 0.5).toFixed(2),
      rating: (Math.random() * 0.5 + 4.5).toFixed(1),
      eta: Math.round(Math.random() * 4 + 2),
    },
    {
      id: 'rapido-1',
      app: 'rapido',
      name: 'Rapido Bike',
      type: 'bike',
      lat: userLat + (Math.random() - 0.5) * 0.008,
      lng: userLng + (Math.random() - 0.5) * 0.008,
      dist: (Math.random() * 1.5 + 0.2).toFixed(2),
      rating: (Math.random() * 0.5 + 4.6).toFixed(1),
      eta: Math.round(Math.random() * 2 + 1),
    },
  ];

  // Use ML to predict prices for each ride
  const ridesWithPredictedPrices = rides.map((ride) => {
    const prediction = pricePredictor.predictRidePrice(
      userLat,
      userLng,
      ride.lat,
      ride.lng,
      ride.type
    );

    return {
      ...ride,
      price: prediction.estimatedPrice,
      mlPredictedPrice: prediction.estimatedPrice,
      confidence: prediction.confidence,
      priceBreakdown: prediction.breakdown,
      distanceToRider: parseFloat(ride.dist),
    };
  });

  // Sort by distance
  const sorted = ridesWithPredictedPrices.sort(
    (a, b) => parseFloat(a.dist) - parseFloat(b.dist)
  );

  console.log('🤖 Prices predicted using ML model');
  console.log('📊 Rides:', sorted);

  res.json(sorted);
});

// ✅ PREDICT PRICE FOR CUSTOM ROUTE
router.post('/predict-price', (req, res) => {
  const { fromLat, fromLng, toLat, toLng, rideType = 'cab' } = req.body;

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  try {
    const prediction = pricePredictor.predictRidePrice(
      fromLat,
      fromLng,
      toLat,
      toLng,
      rideType
    );

    console.log('🤖 Price prediction:', prediction);

    res.json({
      success: true,
      prediction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET PRICE BREAKDOWN
router.get('/price-breakdown/:rideId', (req, res) => {
  const { rideId } = req.params;
  const { lat, lng, destLat, destLng, rideType } = req.query;

  try {
    const prediction = pricePredictor.predictRidePrice(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(destLat),
      parseFloat(destLng),
      rideType
    );

    res.json({
      rideId,
      ...prediction,
      explanation: {
        basePrice: 'Starting fare',
        distanceCharge: 'Cost per km',
        timeCharge: 'Cost per minute',
        trafficCharge: 'Congestion pricing',
        demandCharge: 'Demand surge',
        timeMultiplier: 'Peak hour adjustment',
        dayMultiplier: 'Weekend/Holiday adjustment',
        weatherMultiplier: 'Weather-based surge',
        demandMultiplier: 'Current demand level',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get live locations
router.get('/live-locations', (req, res) => {
  const locations = {};
  for (let i = 1; i <= 5; i++) {
    locations[i] = {
      id: i,
      lat: 27.1767 + (Math.random() - 0.5) * 0.05,
      lng: 78.0081 + (Math.random() - 0.5) * 0.05,
      heading: Math.random() * 360,
      lastUpdate: new Date(),
    };
  }
  res.json(locations);
});

// Update location
router.post('/update-location', (req, res) => {
  const { riderId, lat, lng, heading } = req.body;
  res.json({
    success: true,
    location: { id: riderId, lat, lng, heading, lastUpdate: new Date() },
  });
});

// Book ride
router.post('/book', (req, res) => {
  res.json({
    success: true,
    booking: { id: 'BOOKING-' + Date.now(), status: 'confirmed' },
  });
});

export default router;