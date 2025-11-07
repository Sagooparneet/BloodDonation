const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middleware/auth');

// Get all matched donors for logged-in recipient
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.fullname AS name, u.bloodtype AS blood_type, u.location
       FROM matches m
       JOIN users u ON u.id = m.donor_id
       WHERE m.recipient_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Get the accepted matched blood request for a donor
router.get('/donor/:donorId', async (req, res) => {
  const { donorId } = req.params;

  try {
    const [matches] = await pool.query(`
      SELECT dbr.blood_request_id, br.location, br.date_needed
      FROM donor_blood_requests dbr
      JOIN blood_requests br ON dbr.blood_request_id = br.id
      WHERE dbr.donor_id = ? 
        AND dbr.response = 'accepted'
        AND br.status = 'matched'
      ORDER BY dbr.created_at DESC
      LIMIT 1
    `, [donorId]);

    if (matches.length === 0) {
      return res.json({ matched: false });
    }

    res.json({
      matched: true,
      match: matches[0]
    });
  } catch (err) {
    console.error("Error fetching donor match:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
