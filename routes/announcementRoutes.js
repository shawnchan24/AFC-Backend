const express = require("express");
const Announcement = require("../models/Announcement");

const router = express.Router();

// Fetch all announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Error fetching announcements" });
  }
});

// Add a new announcement
router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const newAnnouncement = new Announcement({ text });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: "Error adding announcement" });
  }
});

module.exports = router;
