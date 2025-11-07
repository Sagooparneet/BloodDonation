const db = require('../lib/db'); // adjust the path if needed

// Get all donors from users table where usertype is 'donor'
exports.getAllDonors = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE usertype = 'donor'");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching donors:", error.message);
    res.status(500).json({ message: "Failed to fetch donors" });
  }
};
