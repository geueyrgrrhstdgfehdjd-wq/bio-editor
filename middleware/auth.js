const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.session?.token;
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    req.user = user;
    next();
  } catch (err) {
    req.user = null;
    res.clearCookie('token');
    if (req.session) req.session.token = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
};

module.exports = { authMiddleware, requireAuth };
