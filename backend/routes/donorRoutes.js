const express = require("express");
const router = express.Router();
const auth = require("../middleware/verifyToken");
const pool = require("../lib/db");

// ✅ Route 1: Filter donors by constituency and blood type
router.get("/donors", async (req, res) => {
  const { bloodtype, constituency } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT fullname, bloodtype, latitude, longitude, availability 
       FROM users 
       WHERE usertype = 'Donor'
       AND bloodtype = ?
       AND location = ?
       AND latitude IS NOT NULL 
       AND longitude IS NOT NULL`,
      [bloodtype, constituency]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching filtered donors:", err);
    res.status(500).json({ error: "Failed to fetch donors" });
  }
});

// ✅ Route 2: Match donors based on latest recipient request
router.get("/donors/match-from-request", auth, async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT blood_type, location, latitude, longitude 
       FROM blood_requests 
       WHERE recipient_id = ? AND status = 'active' 
       ORDER BY requested_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: "No active blood request found" });
    }

    const { blood_type, location, latitude, longitude } = requests[0];

    const [donors] = await pool.query(
      `SELECT id, fullname, bloodtype, latitude, longitude, availability 
       FROM users 
       WHERE usertype = 'Donor'
       AND bloodtype = ?
       AND location = ?
       AND latitude IS NOT NULL 
       AND longitude IS NOT NULL`,
      [blood_type, location]
    );

    // ✅ Send both donor list and request location (for map center)
    res.json({
      center: { latitude, longitude, location },
      donors
    });
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).json({ error: "Failed to fetch donors" });
  }
});

module.exports = router;
