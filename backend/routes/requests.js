const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middleware/auth');

// GET count of active requests for logged-in recipient
router.get('/active', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM blood_requests WHERE recipient_id = ? AND status = 'active'",
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET latest timeline for a recipient
router.get('/timeline/:recipientId', auth, async (req, res) => {
  const { recipientId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT created_at AS requestCreated, matched_at AS matched, completed_at AS completed
       FROM blood_requests WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 1`,
      [recipientId]
    );

    if (!rows.length) return res.json({});
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
