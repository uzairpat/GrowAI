const {
    registerUser,
    loginUser,
    getUserFromSession,
    logoutUser
  } = require('../services/authService');
  
  
  const register = async (req, res) => {
    try {
      const user = await registerUser(req.body);
  
      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
  
      res.status(error.statusCode || 500).json({
        message: error.message || 'Registration failed'
      });
    }
  };
  
  
  const login = async (req, res) => {
    try {
      const { login, password } = req.body;
  
      const { user, sessionToken } = await loginUser({
        login,
        password
      });
  
      res.cookie('growais_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
  
      res.json({
        message: 'Login successful',
        user
      });
    } catch (error) {
      console.error('Login error:', error);
  
      res.status(error.statusCode || 500).json({
        message: error.message || 'Login failed'
      });
    }
  };
  
  
  const me = async (req, res) => {
    try {
      const sessionToken = req.cookies.growais_session;
  
      const user = await getUserFromSession(sessionToken);
  
      if (!user) {
        return res.status(401).json({
          message: 'Not authenticated'
        });
      }
  
      res.json({
        user
      });
    } catch (error) {
      console.error('Session error:', error);
  
      res.status(500).json({
        message: 'Unable to check session'
      });
    }
  };
  
  
  const logout = async (req, res) => {
    try {
      const sessionToken = req.cookies.growais_session;
  
      await logoutUser(sessionToken);
  
      res.clearCookie('growais_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
  
      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
  
      res.status(500).json({
        message: 'Logout failed'
      });
    }
  };
  
  
  module.exports = {
    register,
    login,
    me,
    logout
  };