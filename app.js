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
app.use(express.static(path.join(__dirname, "../index.html")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/afc", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/calendar", calendarRoutes); // Calendar routes
app.use("/api/gallery", galleryRoutes); // Gallery routes
app.use("/api/testimonies", testimonyRoutes); // Testimonies routes

// Serve the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..index.html"));
});

module.exports = app;
