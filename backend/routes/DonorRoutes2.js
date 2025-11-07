const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Get user by ID
router.get('/user/:id', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    results.length > 0 ? res.json({ user: results[0] }) : res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Update profile
router.put('/user/:id', async (req, res) => {
  const { fullname, location } = req.body;
  try {
    await db.query('UPDATE users SET fullname = ?, location = ? WHERE id = ?', [fullname, location, req.params.id]);
    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});

module.exports = router;
