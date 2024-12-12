const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const testimonyRoutes = require("./routes/testimonyRoutes");

const app = express();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for the frontend
app.use(express.static(path.join(__dirname, "../frontend"))); // Correct path to the frontend directory

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/calendar", calendarRoutes); // Calendar routes
app.use("/api/gallery", galleryRoutes); // Gallery routes
app.use("/api/testimonies", testimonyRoutes); // Testimonies routes

// Catch-all route for frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html")); // Ensure the correct path to the frontend index.html
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = app;
