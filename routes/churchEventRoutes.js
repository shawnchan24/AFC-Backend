const express = require("express");
const multer = require("multer");
const ChurchEvent = require("../models/ChurchEvent");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Configure file upload

// Fetch all church events
router.get("/", async (req, res) => {
  try {
    const events = await ChurchEvent.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching church events" });
  }
});

// Add a new church event
router.post("/", upload.single("media"), async (req, res) => {
  const { title, description, date } = req.body;

  try {
    const newEvent = new ChurchEvent({
      title,
      media: req.file.path,
      description,
      date,
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Error adding church event" });
  }
});

module.exports = router;
