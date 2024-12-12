const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const User = require("./models/User");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// User registration
app.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    const user = new User({ email, pin: "1234" });
    await user.save();

    // Notify admin
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "New User Registration",
      text: `A new user has registered: ${email}`,
    });

    res.status(201).json({ message: "Registration successful. Pending admin approval." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, pin } = req.body;

  if (email === process.env.ADMIN_EMAIL && pin === "1532") {
    return res.status(200).json({ isAdmin: true });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.approved) return res.status(403).json({ message: "User not approved." });

    if (pin === "1153") {
      return res.status(200).json({ message: "Login successful." });
    } else {
      return res.status(400).json({ message: "Invalid PIN." });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed." });
  }
});

// Admin routes for managing users
app.get("/api/admin/pending-users", async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Failed to fetch pending users." });
  }
});

app.post("/api/admin/approve-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(userId, { approved: true, pin: "1153" });

    // Notify user
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Account Approved",
      text: "Your account has been approved. You can now log in with your email and PIN: 1153",
    });

    res.status(200).json({ message: "User approved successfully." });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Failed to approve user." });
  }
});

app.post("/api/admin/reject-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    // Notify user
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Account Rejected",
      text: "Your account has been rejected. Please contact support for more information.",
    });

    res.status(200).json({ message: "User rejected successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Failed to reject user." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
