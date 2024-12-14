const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const User = require("./models/User");
const Event = require("./models/Event"); // Import Event model

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
    user: "shawnchan24@gmail.com", // Gmail address
    pass: "lyox qtci bbga mgym", // App-specific password
  },
});

// Routes

// User Registration
app.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    const user = new User({ email, pin: "1234" });
    await user.save();

    // Notify admin
    await transporter.sendMail({
      from: "shawnchan24@gmail.com",
      to: process.env.ADMIN_EMAIL,
      subject: "New User Registration",
      text: `A new user has registered: ${email}`,
    });

    app.get("/test-email", async (req, res) => {
      try {
        await transporter.sendMail({
          from: "shawnchan24@gmail.com",
          to: "daniel.j.turner32@gmail.com ", // Replace this with your test email address
          subject: "Test Email",
          text: "This is a test email from Nodemailer.",
        });
        res.status(200).send("Email sent successfully");
      } catch (error) {
        console.error("Nodemailer test error:", error);
        res.status(500).send("Failed to send email");
      }
    });
    
    res.status(201).json({ message: "Registration successful. Pending admin approval." });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Error registering user." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ message: "Email and PIN are required." });
  }

  try {
    if (email === process.env.ADMIN_EMAIL && pin === "1532") {
      return res.status(200).json({ isAdmin: true });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.approved) return res.status(403).json({ message: "User not approved." });

    if (pin === "1153") {
      return res.status(200).json({ message: "Login successful." });
    } else {
      return res.status(400).json({ message: "Invalid PIN." });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed." });
  }
});

// Admin Routes
app.get("/api/admin/pending-users", async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error.message);
    res.status(500).json({ message: "Failed to fetch pending users." });
  }
});

app.post("/api/admin/approve-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findByIdAndUpdate(userId, { approved: true, pin: "1153" }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    await transporter.sendMail({
      from: "shawnchan24@gmail.com",
      to: user.email,
      subject: "Account Approved",
      text: "Your account has been approved. You can now log in with your email and PIN: 1153",
    });

    res.status(200).json({ message: "User approved successfully." });
  } catch (error) {
    console.error("Error approving user:", error.message);
    res.status(500).json({ message: "Failed to approve user." });
  }
});

app.post("/api/admin/reject-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    await transporter.sendMail({
      from: "shawnchan24@gmail.com",
      to: user.email,
      subject: "Account Rejected",
      text: "Your account has been rejected. Please contact support for more information.",
    });

    res.status(200).json({ message: "User rejected successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error.message);
    res.status(500).json({ message: "Failed to reject user." });
  }
});

// Events Routes
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
