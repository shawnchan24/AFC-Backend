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

// Routes

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

// Mark user as online (call this when a user logs in)
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

// Mark user as offline (call this when a user logs out)
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

// Gallery Routes
// Get approved photos
app.get("/api/gallery", async (req, res) => {
  try {
    const photos = await Photo.find({ approved: true });
    res.json(photos);
  } catch (error) {
    console.error("Error fetching gallery items:", error.message);
    res.status(500).json({ message: "Failed to fetch gallery items." });
  }
});

// Upload photo (pending admin approval)
app.post("/api/gallery", upload.single("photo"), async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption || !req.file) {
      return res.status(400).json({ message: "Photo and caption are required." });
    }

    const photo = new Photo({
      url: `/uploads/${req.file.filename}`,
      caption,
      approved: false,
    });

    await photo.save();

    res.status(201).json({ message: "Photo uploaded successfully. Pending admin approval." });
  } catch (error) {
    console.error("Error uploading photo:", error.message);
    res.status(500).json({ message: "Failed to upload photo." });
  }
});

// Admin: Approve photo
app.post("/api/admin/approve-photo/:id", async (req, res) => {
  try {
    const photoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({ message: "Invalid photo ID." });
    }

    const photo = await Photo.findByIdAndUpdate(photoId, { approved: true }, { new: true });
    if (!photo) return res.status(404).json({ message: "Photo not found." });

    res.status(200).json({ message: "Photo approved successfully." });
  } catch (error) {
    console.error("Error approving photo:", error.message);
    res.status(500).json({ message: "Failed to approve photo." });
  }
});

// Admin: Reject photo
app.delete("/api/admin/reject-photo/:id", async (req, res) => {
  try {
    const photoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({ message: "Invalid photo ID." });
    }

    const photo = await Photo.findByIdAndDelete(photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found." });

    res.status(200).json({ message: "Photo rejected successfully." });
  } catch (error) {
    console.error("Error rejecting photo:", error.message);
    res.status(500).json({ message: "Failed to reject photo." });
  }
});

// Other existing routes remain unchanged...

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
