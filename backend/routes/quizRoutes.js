const express = require("express");
const router = express.Router();
const db = require("../lib/db");

// Save eligibility quiz result
router.post("/quiz-results", async (req, res) => {
  const { user_id, age, weight, chronicIllness, recentDonation, result } = req.body;

  if (!user_id || !age || !weight || !chronicIllness || !recentDonation || !result) {
    return res.status(400).json({ error: "Missing quiz fields." });
  }

  try {
    const [existing] = await db.execute(
      "SELECT id FROM donor_quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [user_id]
    );

    if (existing.length > 0) {
      // Optionally: update the latest quiz record (or insert new always)
      await db.execute(
        `UPDATE donor_quiz_results SET age=?, weight=?, chronic_illness=?, recent_donation=?, result=?, created_at=NOW() WHERE id = ?`,
        [age, weight, chronicIllness, recentDonation, result, existing[0].id]
      );
    } else {
      await db.execute(
        `INSERT INTO donor_quiz_results (user_id, age, weight, chronic_illness, recent_donation, result)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, age, weight, chronicIllness, recentDonation, result]
      );
    }

    res.json({ message: "Quiz result saved." });
  } catch (err) {
    console.error("Quiz insert error:", err);
    res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
