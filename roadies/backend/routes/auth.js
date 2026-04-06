import express from 'express';

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: 1,
      email: email,
      name: email.split('@')[0],
    },
    token: 'mock-jwt-token-' + Date.now(),
  });
});

// Signup endpoint
router.post('/signup', (req, res) => {
  const { email, password, name } = req.body;

  res.status(201).json({
    message: 'Signup successful',
    user: {
      id: 1,
      email: email,
      name: name || email.split('@')[0],
    },
  });
});

// Google login endpoint
router.post('/google', (req, res) => {
  const { email, name } = req.body;

  res.json({
    message: 'Google login successful',
    user: {
      id: 1,
      email: email,
      name: name,
    },
    token: 'mock-google-token-' + Date.now(),
  });
});

export default router;