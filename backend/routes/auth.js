const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const User = require('../models/User');
const DyslexiaData = require('../models/DyslexiaData');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ email, password });
    await user.save();

    // Create initial DyslexiaData entry
    const dyslexiaData = new DyslexiaData({
      userId: user._id,
      assessmentStage: 'questionnaire',
      testHistory: [], // Store history of all tests
      gameProgress: {
        gamesPlayed: 0,
        lastPlayed: null,
        scores: {}
      }
    });
    await dyslexiaData.save();

    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token, redirectTo: '/questionnaire' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token, redirectTo: '/dashboard' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;