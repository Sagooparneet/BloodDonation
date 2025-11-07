const db = require('./db'); // adjust if needed

async function sendAppointmentReminders() {
  try {
    const [appointments] = await db.query(`
      SELECT a.id, a.user_id, a.date, u.fullname
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE DATE(a.date) = CURDATE() + INTERVAL 1 DAY
    `);

    for (const appointment of appointments) {
      const message = `Reminder: You have a blood donation appointment tomorrow (${new Date(appointment.date).toLocaleString()}).`;

      await db.query(
        `INSERT INTO notifications (user_id, type, message) VALUES (?, 'Reminder', ?)`,
        [appointment.user_id, message]
      );
    }

    console.log(`✅ Sent ${appointments.length} reminder notification(s)`);
  } catch (err) {
    console.error('❌ Error sending appointment reminders:', err);
  }
}

module.exports = { sendAppointmentReminders };
