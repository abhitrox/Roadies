const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  if (token.startsWith('mock-token-')) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticate };