import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Expense Tracker API is running.' }));
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: 'An account already exists with this email.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set JWT_SECRET in backend/.env to a random string of at least 32 characters.');
  }
  await connectDB();
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}
