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

// Admin Login Validation Route
app.post("/api/admin/login", (req, res) => {
  const { email, pin } = req.body;

  if (email === ADMIN_EMAIL && pin === ADMIN_PIN) {
    res.status(200).json({ isAdmin: true, message: "Welcome, Admin!" });
  } else {
    res.status(401).json({ message: "Invalid admin credentials." });
  }
});

// User Registration Endpoint
app.post("/register", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = new User({
      email,
      approved: false,
      pin: 1153, // Default PIN
    });

    await user.save();
    res.status(201).json({
      message: "Registration successful. Pending admin approval.",
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Failed to register user." });
  }
});

// User Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res
        .status(400)
        .json({ message: "Both email and PIN are required." });
    }

    const user = await User.findOne({ email, pin });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or PIN." });
    }

    if (!user.approved) {
      return res.status(403).json({
        message: "Your account is pending approval. Please wait for admin approval.",
      });
    }

    res.status(200).json({
      message: "Login successful.",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Failed to log in." });
  }
});

// Admin: Approve User
app.post("/api/admin/approve-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { approved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: `User approved successfully. Their PIN is: 1153.`,
    });
  } catch (error) {
    console.error("Error approving user:", error.message);
    res.status(500).json({ message: "Failed to approve user." });
  }
});

// Admin: Reject User
app.post("/api/admin/reject-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User rejected and removed successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error.message);
    res.status(500).json({ message: "Failed to reject user." });
  }
});

// Fetch Pending Users
app.get("/api/admin/pending-users", async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error.message);
    res.status(500).json({ message: "Failed to fetch pending users." });
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

app.get("/api/gallery/pending", async (req, res) => {
  try {
    const photos = await Photo.find({ approved: false });
    res.json(photos);
  } catch (error) {
    console.error("Error fetching pending photos:", error.message);
    res.status(500).json({ message: "Failed to fetch pending photos." });
  }
});

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

// Admin Approve/Reject Photos
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
