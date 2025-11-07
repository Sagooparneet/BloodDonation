const express = require("express");
const router = express.Router();
const db = require("../lib/db");

function getWeekLabelFromYearWeek(weekKey) {
  const year = Math.floor(weekKey / 100);
  const week = weekKey % 100;

  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - jan4Day + 1);

  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const format = (date) =>
    `${date.toLocaleString("default", { month: "short" })} ${String(date.getDate()).padStart(2, "0")}`;

  return `${format(weekStart)} - ${format(weekEnd)}`;
}

router.get("/stats", async (req, res) => {
  try {
    const [[donors]] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE usertype = 'donor'"
    );
    const [[recipients]] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE usertype = 'recipient'"
    );
    const [[providers]] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE usertype = 'Healthcare Provider'"
    );
    const [[donations]] = await db.execute(
      "SELECT COUNT(*) as total FROM appointments WHERE status = 'Completed'"
    );
    const [[requests]] = await db.execute(
      "SELECT COUNT(*) as total FROM blood_requests"
    );
    const [[constituencies]] = await db.execute(
      "SELECT COUNT(*) as total FROM constituencies"
    );
    const [[hospitals]] = await db.execute(
      "SELECT COUNT(*) as total FROM hospitals"
    );

    const [donationChartData] = await db.execute(`
      SELECT 
        YEARWEEK(date, 3) AS weekKey,
        COUNT(*) AS totalDonations
      FROM appointments
      WHERE status = 'Completed'
      GROUP BY weekKey
      ORDER BY weekKey;
    `);

    const [requestChartData] = await db.execute(`
      SELECT 
        YEARWEEK(requested_at, 3) AS weekKey,
        COUNT(*) AS totalRequests
      FROM blood_requests
      GROUP BY weekKey
      ORDER BY weekKey;
    `);

    const chartMap = new Map();

    for (const row of donationChartData) {
      chartMap.set(row.weekKey, {
        week: getWeekLabelFromYearWeek(row.weekKey),
        totalDonations: row.totalDonations,
        totalRequests: 0,
      });
    }

    for (const row of requestChartData) {
      if (chartMap.has(row.weekKey)) {
        chartMap.get(row.weekKey).totalRequests = row.totalRequests;
      } else {
        chartMap.set(row.weekKey, {
          week: getWeekLabelFromYearWeek(row.weekKey),         totalDonations: 0,
          totalRequests: row.totalRequests,
        });
      }
    }

    const chartData = Array.from(chartMap.entries())
  .sort(([weekKeyA], [weekKeyB]) => weekKeyA - weekKeyB)
  .map(([, values]) => values);


    res.json({
      donors: donors.total,
      recipients: recipients.total,
      providers: providers.total,
      donations: donations.total,
      requests: requests.total,
      constituencies: constituencies.total,
      hospitals: hospitals.total,
      chartData,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

module.exports = router;
