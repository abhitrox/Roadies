const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const ridesRoutes = require('./routes/rides');
const faresRoutes = require('./routes/fares');

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/fares', faresRoutes);

// ===== TEST ROUTE =====
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Roadies Server is running!' });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Roadies Server Started!
  ✅ Server: http://localhost:${PORT}
  ✅ API: http://localhost:${PORT}/api
  ✅ Test: http://localhost:${PORT}/api/test
  `);
});