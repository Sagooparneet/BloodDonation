// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// GET notifications for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [results] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ notifications: results });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
