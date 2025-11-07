const bcrypt = require("bcrypt");
const validator = require("validator");
const { generateToken } = require('../utils/GenerateToken');
const db = require('../lib/db');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { format } = require("date-fns");

// ------------------ SIGNUP CONTROLLER ------------------
const registerAuthController = async (req, res) => {
  const { fullname, username, password, email, phone, bloodtype, location, usertype } = req.body;

  try {
    const [userResult] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (userResult.length > 0) return res.status(400).json({ message: "Username already in use" });

    const [emailResult] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (emailResult.length > 0) return res.status(400).json({ message: "Email already in use" });

    const [phoneResult] = await db.execute("SELECT * FROM users WHERE phone = ?", [phone]);
    if (phoneResult.length > 0) return res.status(400).json({ message: "Phone number already in use" });

    if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email" });

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, with one uppercase letter, one lowercase letter, one number, and one special character."
      });
    }

    const [constResults] = await db.execute("SELECT latitude, longitude FROM constituencies WHERE name = ?", [location]);
    if (constResults.length === 0) {
      return res.status(400).json({ message: "Invalid location: constituency not found" });
    }

    const baseLat = parseFloat(constResults[0].latitude);
    const baseLng = parseFloat(constResults[0].longitude);
    const offsetLat = (Math.random() - 0.5) * 0.04;
    const offsetLng = (Math.random() - 0.5) * 0.04;
    const adjustedLat = parseFloat((baseLat + offsetLat).toFixed(7));
    const adjustedLng = parseFloat((baseLng + offsetLng).toFixed(7));

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [insertResult] = await db.execute(
      `INSERT INTO users 
      (fullname, username, password, email, phone, bloodtype, location, usertype, latitude, longitude, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        fullname,
        username,
        hashedPassword,
        email,
        phone,
        bloodtype,
        location,
        usertype,
        adjustedLat,
        adjustedLng
      ]
    );

    const [newUserRows] = await db.execute("SELECT * FROM users WHERE id = ?", [insertResult.insertId]);
    const newUser = newUserRows[0];

    const token = generateToken(newUser.id);

    res.status(200).json({
      message: "User registered successfully",
      user: newUser,
      token
    });

  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ------------------ LOGIN CONTROLLER ------------------
const loginAuthController = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // ✅ Hardcoded Admin Credentials
    if (email === "admin@blood.org" && password === "admin123") {
      return res.status(200).json({
        message: "Admin login successful",
        token: "admin-token",
        user: {
          id: 0,
          fullname: "System Admin",
          email: "admin@blood.org",
          usertype: "Admin"
        }
      });
    }

    // 🔒 Regular users from DB
    const [userRows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user = userRows[0];

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);

    res.status(200).json({
      message: "Login successful",
      user,
      token
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ FORGOT PASSWORD CONTROLLER ------------------
const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss");

    await db.execute(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Password Reset Request",
      text: `Hi ${user.fullname},\n\nClick below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });

  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).json({ message: "Server error sending password reset email" });
  }
};

// ------------------ RESET PASSWORD CONTROLLER ------------------
const resetPasswordController = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

  try {
    const [rows] = await db.execute(
      "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()",
      [token]
    );

    if (rows.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

    const resetEntry = rows[0];

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, resetEntry.user_id]);

    await db.execute("DELETE FROM password_resets WHERE id = ?", [resetEntry.id]);

    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).json({ message: "Server error updating password" });
  }
};

// ------------------ EXPORTS ------------------
module.exports = {
  registerAuthController,
  loginAuthController,
  forgotPasswordController,
  resetPasswordController
};
