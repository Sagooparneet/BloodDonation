const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// ✅ CREATE APPOINTMENT (returns created appointment for frontend)
router.post('/appointments', async (req, res) => {
  const { user_id, date, location, status, units} = req.body;

  if (!user_id || !date || !location || !status || !units) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO appointments (user_id, date, location, status, units) VALUES (?, ?, ?, ?, ?)',
      [user_id, date, location, status, units]
    );

    const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);

    res.status(201).json({ appointment: rows[0] }); // ✅ Return new appointment
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// ✅ GET USER APPOINTMENTS
router.get('/appointments/:userId', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM appointments WHERE user_id = ?',
      [req.params.userId]
    );
    res.json({ appointments: results });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// ✅ GET ALL APPOINTMENTS (for health provider or admin)
router.get('/all-appointments', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT a.id, a.date, a.location, a.status, u.fullname AS donor_name, u.bloodtype
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.date DESC
    `);
    res.json({ appointments: results });
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// ✅ UPDATE APPOINTMENT STATUS
router.put('/appointments/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE appointments SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.status(200).json({ message: "Appointment status updated successfully." });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
