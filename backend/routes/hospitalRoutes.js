const express = require("express");
const router = express.Router();
const db = require("../lib/db");

// GET /api/hospitals/:constituency
router.get("/:constituency", async (req, res) => {
  const { constituency } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM hospitals WHERE constituency = ?",
      [constituency]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching hospitals:", err.message);
    res.status(500).json({ message: "Error fetching hospitals" });
  }
});

module.exports = router;
