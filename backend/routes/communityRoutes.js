const express = require("express");
const router = express.Router();
const db = require("../lib/db");
const auth = require("../middleware/verifyToken");

// ✅ GET all stories
router.get("/stories", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT r.story, r.created_at, u.fullname 
      FROM recovery_stories r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /stories failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST a new story
router.post("/stories", auth, async (req, res) => {
  const { story } = req.body;
  const userId = req.user.id;

  if (!story) {
    return res.status(400).json({ message: "Story is required" });
  }

  try {
    await db.execute(
      `INSERT INTO recovery_stories (user_id, story, created_at) VALUES (?, ?, NOW())`,
      [userId, story]
    );
    res.status(201).json({ message: "Story posted successfully" });
  } catch (err) {
    console.error("POST /stories failed:", err);
    res.status(500).json({ message: "Database insert error" });
  }
});

module.exports = router;
