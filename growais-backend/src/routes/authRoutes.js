const express = require('express');

const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  me,
  logout
} = require('../controllers/authController');


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

router.post('/register', authLimiter, register);

router.post('/login', authLimiter, login);

router.get('/me', me);

router.post('/logout', logout);


module.exports = router;
