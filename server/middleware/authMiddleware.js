const jwt = require('jsonwebtoken');

// Authenticate user and attach decoded user to request
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // expects "Bearer token"
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Restrict access to admin role
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = {
  protect,
  adminOnly
};
