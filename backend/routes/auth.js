// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user (student or librarian)
router.post('/register', async (req, res) => {
  const { name, email, password, role, librarianCode } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    if (role === 'librarian') {
      if (librarianCode !== process.env.LIBRARIAN_CODE) {
        return res.status(400).json({ msg: 'Invalid librarian code' });
      }
    }

    user = new User({ name, email, password, role });
    await user.save();

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

const payload = { id: user._id, role: user.role };
const token = jwt.sign(
  payload, 
  process.env.JWT_SECRET, 
  { 
    expiresIn: '7d',  // ← MUST be here
    algorithm: 'HS256'
  }
);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;