const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// 🔍 GET all blood requests
router.get('/blood-requests', async (req, res) => {
  try {
    const [requests] = await db.query('SELECT * FROM blood_requests ORDER BY created_at DESC');
    res.json({ requests });
  } catch (err) {
    console.error('Error fetching blood requests:', err);
    res.status(500).json({ error: 'Error fetching blood requests' });
  }
});

// 🔄 UPDATE status of a blood request (Approve/Reject)
router.put('/blood-requests/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await db.query('UPDATE blood_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Request ${id} updated to ${status}` });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

module.exports = router;
