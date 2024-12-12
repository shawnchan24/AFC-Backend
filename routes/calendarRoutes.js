const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error });
  }
});

// Get events for a specific date
router.get("/:date", async (req, res) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    const events = await Event.find({ date });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error });
  }
});

// Add a new event
router.post("/", async (req, res) => {
  try {
    const { title, date, description } = req.body;
    if (!title || !date || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newEvent = new Event({ title, date, description });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to add event", error });
  }
});

// Update an existing event
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event", error });
  }
});

// Delete an event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error });
  }
});

module.exports = router;
