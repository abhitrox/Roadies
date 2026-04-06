import express from 'express';

const router = express.Router();

// Estimate fare
router.post('/estimate', (req, res) => {
  const { from, to, rideType } = req.body;

  const baseFare = {
    cab: 50,
    auto: 30,
    bike: 20,
  };

  const fare = (baseFare[rideType] || 50) + Math.random() * 100;

  res.json({
    estimatedFare: Math.round(fare),
    rideType: rideType,
    from: from,
    to: to,
    surgeMultiplier: 1.0,
  });
});

// Compare fares
router.post('/compare', (req, res) => {
  const { from, to } = req.body;

  res.json({
    fares: [
      { app: 'uber', name: 'Uber Go', price: 150, eta: 5 },
      { app: 'ola', name: 'Ola Mini', price: 145, eta: 6 },
      { app: 'rapido', name: 'Rapido Bike', price: 80, eta: 3 },
    ],
    from: from,
    to: to,
  });
});

export default router;