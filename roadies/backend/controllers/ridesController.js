const RIDES = [
  { id: 1, app: 'uber', logo: 'UBER', name: 'Uber Go', type: 'cab', dist: 0.8, rating: 4.3, seats: 4 },
  { id: 2, app: 'ola', logo: 'OLA', name: 'Ola Mini', type: 'cab', dist: 1.2, rating: 4.1, seats: 4 },
  { id: 3, app: 'rapido', logo: 'RPDO', name: 'Rapido Bike', type: 'bike', dist: 0.5, rating: 4.5, seats: 1 },
  { id: 4, app: 'uber', logo: 'UBER', name: 'Uber Auto', type: 'auto', dist: 1.5, rating: 4.2, seats: 3 },
  { id: 5, app: 'ola', logo: 'OLA', name: 'Ola Auto', type: 'auto', dist: 1.0, rating: 4.0, seats: 3 },
  { id: 6, app: 'rapido', logo: 'RPDO', name: 'Rapido Auto', type: 'auto', dist: 0.9, rating: 4.4, seats: 3 },
  { id: 7, app: 'uber', logo: 'UBER', name: 'Uber XL', type: 'xl', dist: 2.1, rating: 4.6, seats: 6 },
  { id: 8, app: 'ola', logo: 'OLA', name: 'Ola Prime', type: 'xl', dist: 2.4, rating: 4.3, seats: 6 }
];

const ridesController = {
  getNearbyRides: (req, res) => {
    const sorted = [...RIDES].sort((a, b) => a.dist - b.dist);
    res.json(sorted);
  },

  getFilteredRides: (req, res) => {
    const { type } = req.params;
    let filtered = RIDES;

    if (type !== 'all') {
      filtered = RIDES.filter(r => r.type === type);
    }

    const sorted = [...filtered].sort((a, b) => a.dist - b.dist);
    res.json(sorted);
  },

  selectRide: (req, res) => {
    const { id } = req.params;
    const ride = RIDES.find(r => r.id === parseInt(id));

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json({ success: true, ride });
  }
};

module.exports = ridesController;