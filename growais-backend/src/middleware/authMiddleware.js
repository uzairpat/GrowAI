const { getUserFromSession } = require('../services/authService');

const authenticateUser = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.growais_session;

    if (!sessionToken) {
      return res.status(401).json({
        message: 'Not authenticated. Please log in.'
      });
    }

    const user = await getUserFromSession(sessionToken);

    if (!user || !user.is_active) {
      return res.status(401).json({
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    // Make the authenticated user available to protected routes.
    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);

    return res.status(500).json({
      message: 'Authentication failed.'
    });
  }
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      message: 'Access restricted to student accounts.'
    });
  }

  next();
};

module.exports = {
  authenticateUser,
  requireStudent
};