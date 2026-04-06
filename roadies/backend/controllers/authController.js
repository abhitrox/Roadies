const authController = {
  login: (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Mock authentication
    res.json({
      success: true,
      user: {
        id: 1,
        email: email,
        name: email.split('@')[0].toUpperCase()
      },
      token: 'mock-token-' + Date.now()
    });
  },

  signup: (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    res.json({
      success: true,
      user: { id: 1, email, name },
      token: 'mock-token-' + Date.now()
    });
  },

  logout: (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  }
};

module.exports = authController;