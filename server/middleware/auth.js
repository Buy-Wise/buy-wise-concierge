const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const tokenSources = [
    req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null,
    req.query.token,
    req.cookies?.token
  ].filter(t => t && t !== 'undefined' && t !== 'null' && t !== '');

  let lastError = null;

  for (const token of tokenSources) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      lastError = error;
    }
  }

  return res.status(401).json({ 
    error: 'Access denied. Invalid or missing token.', 
    details: lastError?.message 
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
};

module.exports = { verifyToken, isAdmin };
