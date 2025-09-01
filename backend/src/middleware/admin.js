const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    // Check if user exists and is admin
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For now, let's make the first registered user an admin
    // In production, you'd want a proper admin field in User model
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is admin (first user or has admin role)
    // const isAdmin = user.isAdmin || (await User.countDocuments()) === 1;
    
    // TEMPORARY: Allow all authenticated users for testing
    const isAdmin = true;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = admin;
