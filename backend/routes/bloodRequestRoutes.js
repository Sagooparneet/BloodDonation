const express = require('express');
const router = express.Router();
const db = require('../../src/lib/db');
const auth = require('../middleware/verifyToken');

// Create blood request 
router.post('/', auth, async (req, res) => {
  const {
    blood_type,
    urgency_level,
    units,
    location,
    contact_info,
    date_needed
  } = req.body;

  if (!blood_type || !urgency_level || !units || !location || !contact_info || !date_needed) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [coords] = await db.execute(
      `SELECT latitude, longitude FROM constituencies WHERE name = ?`,
      [location]
    );

    if (coords.length === 0) {
      return res.status(400).json({ message: "Invalid constituency selected." });
    }

    const constituency = coords[0];
    const offsetLat = (Math.random() - 0.5) * 0.04;
    const offsetLng = (Math.random() - 0.5) * 0.04;

    const adjustedLatitude = parseFloat(constituency.latitude) + offsetLat;
    const adjustedLongitude = parseFloat(constituency.longitude) + offsetLng;

    // INSERT and GET insertId back
    const [result] = await db.execute(
      `INSERT INTO blood_requests 
        (recipient_id, blood_type, urgency_level, units, location, contact_info, date_needed, latitude, longitude, requested_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'active')`,
      [
        req.user.id,
        blood_type,
        urgency_level,
        units,
        location,
        contact_info,
        date_needed,
        adjustedLatitude,
        adjustedLongitude
      ]
    );

    // Return the inserted request_id so frontend can use it
    res.status(201).json({
      message: "Blood request submitted successfully!",
      request_id: result.insertId,
    });

  } catch (err) {
    console.error("Error inserting blood request:", err);
    res.status(500).json({ message: "Database error. Please try again later." });
  }
});


// GET active request count
router.get('/active', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS count FROM blood_requests 
       WHERE recipient_id = ? AND status = 'active'`,
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch active request count" });
  }
});

// Mark request as matched
router.post('/mark-matched', auth, async (req, res) => {
  try {
    await db.execute(
      `UPDATE blood_requests
       SET matched_at = NOW(), status = 'matched'
       WHERE recipient_id = ? AND status = 'active'
       ORDER BY requested_at DESC LIMIT 1`,
      [req.user.id]
    );
    res.json({ message: "Request marked as matched" });
  } catch (err) {
    console.error("Failed to mark matched:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark request as completed
router.post('/mark-complete', auth, async (req, res) => {
  try {
    await db.execute(
      `UPDATE blood_requests
       SET completed_at = NOW(), status = 'completed'
       WHERE id = (
         SELECT id FROM (
           SELECT id FROM blood_requests 
           WHERE recipient_id = ? AND status = 'active' 
           ORDER BY requested_at DESC 
           LIMIT 1
         ) AS subquery
       )`,
      [req.user.id]
    );

    res.json({ message: "Request marked as completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating request" });
  }
});

// GET last request coordinates
router.get('/last-request-coords', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT latitude, longitude, location 
       FROM blood_requests 
       WHERE recipient_id = ? AND status = 'active'
       ORDER BY requested_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No active requests found for this user." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching last request coordinates:", err);
    res.status(500).json({ message: "Server error while retrieving location." });
  }
});

// GET all blood requests for healthcare providers
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        br.id,
        br.recipient_id,
        u.fullname AS recipient_name,
        br.blood_type,
        br.urgency_level,
        br.units,
        br.location,
        br.contact_info,
        br.date_needed,
        br.status,
        br.requested_at
      FROM blood_requests br
      JOIN (
    SELECT recipient_id, MAX(id) AS max_id
    FROM blood_requests
    GROUP BY recipient_id
  ) latest ON br.id = latest.max_id
  JOIN users u ON br.recipient_id = u.id
  ORDER BY br.requested_at DESC
    `);

    res.json({ requests: rows });
  } catch (err) {
    console.error(" Error fetching all blood requests:", err);
    res.status(500).json({ message: "Failed to retrieve blood requests" });
  }
});

// Match from latest request (used in donor matching)
router.get('/match-from-request', auth, async (req, res) => {
  try {
    const [requests] = await db.execute(`
      SELECT br.*, u.fullname 
      FROM blood_requests br
      JOIN users u ON br.recipient_id = u.id
      WHERE br.recipient_id = ? AND br.status = 'active'
      ORDER BY requested_at DESC 
      LIMIT 1
    `, [req.user.id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: "No active blood request found" });
    }

    const { blood_type, location, latitude, longitude, fullname } = requests[0];

    const [donors] = await db.execute(
  `SELECT u.id, u.fullname, u.bloodtype, u.latitude, u.longitude, u.availability, u.location
   FROM users u
   WHERE u.usertype = 'Donor'
     AND u.bloodtype = ?
     AND u.location = ?
     AND u.latitude IS NOT NULL 
     AND u.longitude IS NOT NULL
     AND u.id NOT IN (
       SELECT donor_id 
       FROM donor_blood_requests 
       WHERE request_id = ? AND response = 'rejected'
     )`,
  [blood_type, location, requests[0].id]
);


    res.json({
      center: { latitude, longitude, location, fullname },
      donors
    });
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).json({ error: "Failed to fetch donors" });
  }
});

// Get latest request status
router.get('/latest-status', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT status 
       FROM blood_requests 
       WHERE recipient_id = ? 
       ORDER BY requested_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) return res.json({ status: "none" });

    res.json({ status: rows[0].status });
  } catch (err) {
    console.error("Failed to get latest request status:", err);
    res.status(500).json({ message: "Error retrieving status" });
  }
});

// Send request to donor
router.post("/send-donor-request", auth, async (req, res) => {
  const { donor_id, request_id, hospital_name } = req.body;

  if (!donor_id || !request_id || !hospital_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM donor_blood_requests WHERE donor_id = ? AND request_id = ?",
      [donor_id, request_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Request already sent to this donor." });
    }

    await db.query(
      "INSERT INTO donor_blood_requests (donor_id, request_id, response, hospital_name) VALUES (?, ?, 'pending', ?)",
      [donor_id, request_id, hospital_name]
    );
    console.log("Updating request to pending:", request_id);
    await db.execute(
      `UPDATE blood_requests SET status = 'pending' WHERE id = ? AND status = 'active'`,
      [request_id]
    );
    
    const [[recipient]] = await db.query(
      `SELECT u.fullname, br.blood_type, br.location
       FROM blood_requests br
       JOIN users u ON br.recipient_id = u.id
       WHERE br.id = ?`,
      [request_id]
    );

    if (!recipient) {
      return res.status(404).json({ error: "Blood request or recipient not found." });
    }

    const message = `You have a blood request from ${recipient.fullname} (Blood Type: ${recipient.blood_type}) at ${hospital_name}, ${recipient.location}.`;

    await db.query(
      "INSERT INTO notifications (user_id, message, type, request_id) VALUES (?, ?, 'Blood Request', ?)",
      [donor_id, message, request_id]
    );

    res.status(200).json({ success: true, message: "Request sent to donor." });

  } catch (err) {
    console.error(" Error in /send-donor-request:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});


// Get all blood requests sent to a donor
router.get('/donor-requests', auth, async (req, res) => {
  const donorId = req.user.id;

  try {
    const [rows] = await db.execute(`
      SELECT dbr.id, br.id AS request_id,  dbr.response, dbr.hospital_name, 
             br.blood_type, br.location, br.date_needed,
             u.fullname AS recipient_name
      FROM donor_blood_requests dbr
      JOIN blood_requests br ON dbr.request_id = br.id
      JOIN users u ON br.recipient_id = u.id
      WHERE dbr.donor_id = ?
      ORDER BY dbr.id DESC
    `, [donorId]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching donor blood requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Donor accepts or rejects a blood request
router.post('/donor-requests/respond', auth, async (req, res) => {
  console.log(" Respond route HIT!");

  const donorId = req.user.id;
  const { request_id, response } = req.body;

  if (!['accepted', 'rejected'].includes(response)) {
    return res.status(400).json({ message: "Invalid response type." });
  }

  try {
    const [[request]] = await db.execute(
      `SELECT status FROM blood_requests WHERE id = ?`,
      [request_id]
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    const [[acceptedDonor]] = await db.execute(
      `SELECT id FROM donor_blood_requests 
       WHERE request_id = ? AND response = 'accepted'`,
      [request_id]
    );

    if (acceptedDonor && response === 'accepted') {
      return res.status(400).json({ message: "Another donor has already accepted this request." });
    }

    const [updateRes] = await db.execute(
      `UPDATE donor_blood_requests 
       SET response = ? 
       WHERE donor_id = ? AND request_id = ? AND response = 'pending'`,
      [response, donorId, request_id]
    );

    if (updateRes.affectedRows === 0) {
      return res.status(400).json({ message: "You already responded or request not found." });
    }

 if (response === 'accepted') {
  await db.execute(
    `UPDATE blood_requests 
     SET status = 'matched', matched_at = NOW()
     WHERE id = ?`,
    [request_id]
  );
}


if (response === 'rejected') {
  await db.execute(
    `UPDATE blood_requests 
     SET status = 'rejected'
     WHERE id = ?`,
    [request_id]
  );
}

    await db.execute(
      `UPDATE notifications
       SET message = CONCAT(message, '  ', ?) 
       WHERE user_id = ? AND request_id = ? AND type = 'Blood Request'`,
      [response.charAt(0).toUpperCase() + response.slice(1), donorId, request_id]
    );

    res.json({ message: `You have ${response} the request.` });
  } catch (err) {
    console.error("Error updating donor response:", err);
    res.status(500).json({ message: "Error saving response." });
  }
});

module.exports = router;
