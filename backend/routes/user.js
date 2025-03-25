const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DyslexiaData = require('../models/DyslexiaData');

router.get('/data', auth, async (req, res) => {
  try {
    const userData = await DyslexiaData.findOne({ userId: req.user });
    if (!userData) {
      return res.status(404).json({ msg: 'User data not found' });
    }
    res.json(userData);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 