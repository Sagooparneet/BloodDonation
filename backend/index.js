// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./lib/db');
const app = express();
const port = process.env.PORT || 3001;

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bloodRequestRoutes = require('./routes/bloodRequestRoutes');
const donorRoutes = require('./routes/donorRoutes');
const constituencyRoutes = require("./routes/constituencyRoutes");
const communityRoutes = require('./routes/communityRoutes');
const DonorRoutes2 = require('./routes/DonorRoutes2'); 
const appointmentRoutes = require('./routes/appointmentRoutes'); 
const notificationRoutes = require('./routes/notificationRoutes'); 
const providerBloodRequestRoutes = require('./routes/providerBloodRequestRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const quizRoutes = require('./routes/quizRoutes'); 
const hospitalRoutes = require("./routes/hospitalRoutes");
const adminStatsRoutes = require('./routes/adminStats');
// Middlewares
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://parneet.me',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use Routes
app.use('/auth', authRoutes);
app.use('/api/blood-request', bloodRequestRoutes);
app.use('/api', donorRoutes);
app.use('/api/constituencies', constituencyRoutes);
app.use("/api/community", communityRoutes);
app.use('/api', DonorRoutes2); 
app.use('/api/provider-blood-request', providerBloodRequestRoutes);
app.use('/api', appointmentRoutes); 
app.use('/api/notifications', notificationRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/quiz', quizRoutes);
app.use("/api/hospitals", hospitalRoutes); 
app.use('/api/admin', adminStatsRoutes);
async function startServer() {
  try {
    await db.execute('SELECT 1');

    console.log('✅ Connected to MySQL database');
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    process.exit(1);
  }
}

// CRON Job: Appointment Reminders
const cron = require('node-cron');
const { sendAppointmentReminders } = require('./lib/utils'); 

// Run every day at 12 AM
cron.schedule('0 0 * * *', () => {
  console.log('🕘 Running daily reminder cron job...');
  sendAppointmentReminders();
});

// Test Route for Reminder
app.get('/test-reminder', async (req, res) => {
  try {
    await sendAppointmentReminders();
    res.send('✅ Reminder notifications sent!');
  } catch (err) {
    res.status(500).send('❌ Error sending reminders');
  }
});

startServer();
