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

// Admin User Login Information
const ADMIN_EMAIL = "shawnchan24@gmail.com";
const ADMIN_PIN = "1532";

// Login Route for Admin and Regular Users
app.post("/login", async (req, res) => {
  const { email, pin } = req.body;

  try {
    if (email === ADMIN_EMAIL && pin === ADMIN_PIN) {
      return res.status(200).json({ isAdmin: true, message: "Welcome, Admin!" });
    }

    const user = await User.findOne({ email, pin });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or PIN." });
    }

    if (!user.approved) {
      return res.status(403).json({ message: "Your account is not yet approved." });
    }

    res.status(200).json({ isAdmin: false, approved: user.approved, message: "Login successful!" });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Failed to log in due to a server issue." });
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

// Pending Users Route
app.get("/api/admin/pending-users", async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error.message);
    res.status(500).json({ message: "Failed to fetch pending users." });
  }
});

// Registration Route
app.post("/register", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const newUser = new User({
    email,
    pin: "1153", // Assign default PIN
    approved: false,
    online: false,
  });

  try {
    await newUser.save();
    res.status(201).json({ message: "Registration successful. Pending admin approval." });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Failed to register user." });
  }
});

// Approve User Route
app.post("/api/admin/approve-user/:id", async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { approved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({
      message: "User approved successfully. They can log in with PIN: 1153.",
    });
  } catch (error) {
    console.error("Error approving user:", error.message);
    res.status(500).json({ message: "Failed to approve user." });
  }
});

// Reject User Route
app.post("/api/admin/reject-user/:id", async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "User rejected successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error.message);
    res.status(500).json({ message: "Failed to reject user." });
  }
});

// Gallery Routes
app.get("/api/gallery", async (req, res) => {
  try {
    const photos = await Photo.find({ approved: true });
    res.json(photos);
  } catch (error) {
    console.error("Error fetching gallery items:", error.message);
    res.status(500).json({ message: "Failed to fetch gallery items." });
  }
});

app.post("/api/gallery", upload.single("photo"), async (req, res) => {
  const { caption } = req.body;

  if (!caption || !req.file) {
    return res.status(400).json({ message: "Photo and caption are required." });
  }

  const photo = new Photo({
    url: `/uploads/${req.file.filename}`,
    caption,
    approved: false,
  });

  try {
    await photo.save();
    res.status(201).json({ message: "Photo uploaded successfully. Pending admin approval." });
  } catch (error) {
    console.error("Error uploading photo:", error.message);
    res.status(500).json({ message: "Failed to upload photo." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
