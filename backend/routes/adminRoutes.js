const express = require('express');
const router = express.Router();
const db = require('../lib/db');

router.get('/users', async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, fullname, email, usertype, bloodtype, location, status FROM users`
    );
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname } = req.body;
    await db.execute(`UPDATE users SET fullname = ? WHERE id = ?`, [fullname, id]);
    res.json({ message: 'Full Name updated.' });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user." });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.execute(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: 'User status updated.' });
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(500).json({ error: "Failed to update status." });
  }
});

module.exports = router;
