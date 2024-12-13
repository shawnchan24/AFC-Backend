const express = require("express");
const router = express.Router();

// Mock data for past events (replace with actual database query logic)
const events = [
  {
    id: 1,
    title: "Christmas Service 2023",
    description: "A special service celebrating the birth of Jesus.",
    mediaUrl: "https://example.com/images/christmas.jpg"
  },
  {
    id: 2,
    title: "Youth Revival 2023",
    description: "A youth-focused event with powerful sermons and music.",
    mediaUrl: "https://example.com/images/revival.jpg"
  },
  {
    id: 3,
    title: "Thanksgiving Outreach 2023",
    description: "Reaching out to the community with food and love.",
    mediaUrl: "https://example.com/images/thanksgiving.jpg"
  }
];

// GET endpoint to fetch all past events
router.get("/api/events", (req, res) => {
  try {
    res.status(200).json(events); // Return the mock data as JSON
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});

module.exports = router;
