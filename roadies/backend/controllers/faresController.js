const TARIFFS = {
  uber: {
    bike: { base: 15, perKm: 4.5, perMin: 0.75, minFare: 25 },
    auto: { base: 25, perKm: 9, perMin: 1.0, minFare: 40 },
    cab: { base: 50, perKm: 12, perMin: 1.25, minFare: 80 },
    xl: { base: 80, perKm: 18, perMin: 2.0, minFare: 130 }
  },
  ola: {
    bike: { base: 12, perKm: 4.0, perMin: 0.60, minFare: 22 },
    auto: { base: 22, perKm: 8.5, perMin: 0.90, minFare: 38 },
    cab: { base: 45, perKm: 11, perMin: 1.10, minFare: 75 },
    xl: { base: 75, perKm: 17, perMin: 1.80, minFare: 120 }
  },
  rapido: {
    bike: { base: 10, perKm: 3.5, perMin: 0.50, minFare: 20 },
    auto: { base: 20, perKm: 7.5, perMin: 0.80, minFare: 35 },
    cab: { base: 40, perKm: 10, perMin: 1.0, minFare: 70 },
    xl: { base: 70, perKm: 15, perMin: 1.60, minFare: 110 }
  }
};

const SURGE_CURVE = [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.3, 1.8, 2.2, 1.7, 1.3, 1.1, 1.1, 1.0, 1.0, 1.1, 1.2, 1.4, 1.8, 2.1, 1.9, 1.5, 1.2, 1.1];
const SENS = { uber: 1.0, ola: 0.85, rapido: 0.70 };
const SPEED = { bike: 22, auto: 18, cab: 20, xl: 18 };

const getSurge = (app, h) => 1 + (SURGE_CURVE[h] - 1) * SENS[app];

const faresController = {
  calculateFare: (req, res) => {
    const { app, type, distance, hour } = req.query;

    if (!app || !type || !distance || hour === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const t = TARIFFS[app][type];
    const surge = getSurge(app, parseInt(hour));
    const mins = (parseFloat(distance) / SPEED[type]) * 60;
    const raw = t.base + (t.perKm * parseFloat(distance)) + (t.perMin * mins);
    const final = Math.max(t.minFare, raw * surge);

    res.json({
      total: Math.round(final),
      low: Math.round(final * 0.93),
      high: Math.round(final * 1.07),
      surge: Math.round(surge * 10) / 10,
      mins: Math.round(mins),
      base: Math.round(t.base),
      distCharge: Math.round(t.perKm * parseFloat(distance)),
      timeCharge: Math.round(t.perMin * mins)
    });
  },

  getSurgeMultiplier: (req, res) => {
    const { hour } = req.params;
    const surge = getSurge('uber', parseInt(hour));

    res.json({ surge: Math.round(surge * 10) / 10 });
  }
};

module.exports = faresController;