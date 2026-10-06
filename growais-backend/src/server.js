const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = require('./db/pool');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// CORS
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    ...configuredOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]),
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests and local development origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

// Request parsing
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

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
      user_count: Number(result.rows[0].count),
    });
  } catch (error) {
    console.error('Database test error:', error);

    res.status(500).json({
      status: 'error',
      database: 'growais',
      users_table: 'not accessible',
    });
  }
});

// Keep operational errors JSON-shaped for the frontend and avoid Express's
// default HTML error responses exposing implementation details.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.message?.startsWith('CORS blocked origin:')) {
    return res.status(403).json({ message: 'This origin is not allowed.' });
  }

  console.error('Unhandled request error:', error);
  return res.status(500).json({ message: 'Unable to process this request.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GrowAIs backend running on http://localhost:${PORT}`);
});
