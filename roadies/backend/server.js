import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import ridesRoutes from './routes/rides.js';
import faresRoutes from './routes/fares.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware - Functions, not objects
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes - Use .router property if it exists
app.use('/api/auth', authRoutes.router || authRoutes);
app.use('/api/rides', ridesRoutes.router || ridesRoutes);
app.use('/api/fares', faresRoutes.router || faresRoutes);

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Roadies Backend is Running!' });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log('\n🚀 Roadies Server Started!');
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ API: http://localhost:${PORT}/api`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health\n`);
});