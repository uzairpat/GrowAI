const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = require('./db/pool');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Request parsing
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use('/api/auth', authRoutes);
// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Health check database error:', error);

    res.status(500).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});
app.get('/api/health/db', async (req, res) => {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM users');
  
      res.json({
        status: 'ok',
        database: 'growais',
        users_table: 'accessible',
        user_count: Number(result.rows[0].count)
      });
    } catch (error) {
      console.error('Database test error:', error);
  
      res.status(500).json({
        status: 'error',
        database: 'growais',
        users_table: 'not accessible'
      });
    }
  });
// Start server
app.listen(PORT, () => {
  console.log(`🚀 GrowAIs backend running on http://localhost:${PORT}`);
});