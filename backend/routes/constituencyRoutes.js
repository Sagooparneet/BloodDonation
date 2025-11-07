const express = require("express");
const router = express.Router();
const db = require("../lib/db");

// GET /api/constituencies
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM constituencies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching constituencies" });
  }
});

module.exports = router;
