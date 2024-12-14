const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
require("dotenv").config(); // Load environment variables

const User = require("./models/User");
const Event = require("./models/Event"); // Import Event model
const Photo = require("./models/Photo"); // Import Photo model

const app = express();

// Middleware: Configure CORS
app.use(
  cors({
    origin: "https://theafc.life", // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, headers)
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the application if the connection fails
  });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "shawnchan24@gmail.com", // Admin Gmail address
    pass: "lyox qtci bbga mgym", // App-specific password
  },
});

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Admin User Login Information (unchanged)
const ADMIN_EMAIL = "shawnchan24@gmail.com";
const ADMIN_PIN = "1532";

// Admin Login Validation Route (unchanged functionality)
app.post("/api/admin/login", (req, res) => {
  const { email, pin } = req.body;

  if (email === ADMIN_EMAIL && pin === ADMIN_PIN) {
    res.status(200).json({ isAdmin: true, message: "Welcome, Admin!" });
  } else {
    res.status(401).json({ message: "Invalid admin credentials." });
  }
});

// Fetch total users and online users count
app.get("/api/admin/user-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Total number of users
    const onlineUsers = await User.countDocuments({ online: true }); // Users with "online: true"

    res.status(200).json({ totalUsers, onlineUsers });
  } catch (error) {
    console.error("Error fetching user stats:", error.message);
    res.status(500).json({ message: "Failed to fetch user stats." });
  }
});

// Mark user as online (called when a user logs in)
app.post("/api/users/online/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findByIdAndUpdate(userId, { online: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "User marked as online." });
  } catch (error) {
    console.error("Error marking user as online:", error.message);
    res.status(500).json({ message: "Failed to mark user as online." });
  }
});

// Mark user as offline (called when a user logs out)
app.post("/api/users/offline/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findByIdAndUpdate(userId, { online: false }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "User marked as offline." });
  } catch (error) {
    console.error("Error marking user as offline:", error.message);
    res.status(500).json({ message: "Failed to mark user as offline." });
  }
});

// Test Email Endpoint
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: "shawnchan24@gmail.com",
      to: "daniel.j.turner32@gmail.com", // Replace with the test email address
      subject: "Test Email",
      text: "This is a test email from Nodemailer.",
    });
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Nodemailer test error:", error);
    res.status(500).send("Failed to send email");
  }
});

// User Registration
app.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const newUser = new User({
      email,
      approved: false, // Not approved initially
      pin: null, // PIN will be set upon admin approval
    });

    await newUser.save();

    // Notify admin of the new registration
    await transporter.sendMail({
      from: "shawnchan24@gmail.com",
      to: ADMIN_EMAIL,
      subject: "New User Registration",
      text: `A new user has registered: ${email}`,
    });

    res.status(201).json({ message: "Registration successful. Pending admin approval." });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Failed to register user." });
  }
});

// Approve User and Assign PIN
app.post("/api/admin/approve-user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { approved: true, pin: "1153" }, // Set default PIN upon approval
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await transporter.sendMail({
      from: "shawnchan24@gmail.com",
      to: user.email,
      subject: "Account Approved",
      text: `Your account has been approved. You can now log in with your email and the default PIN: 1153`,
    });

    res.status(200).json({ message: "User approved successfully." });
  } catch (error) {
    console.error("Error approving user:", error.message);
    res.status(500).json({ message: "Failed to approve user." });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, pin } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or PIN." });
    }

    if (!user.approved) {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    if (user.pin === pin) {
      res.status(200).json({ message: "Login successful." });
    } else {
      res.status(400).json({ message: "Invalid email or PIN." });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Failed to log in." });
  }
});

// Gallery Routes remain unchanged...
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
