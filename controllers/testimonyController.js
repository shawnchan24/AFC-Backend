const Testimony = require("../models/Testimony");

// Fetch all testimonies
exports.getTestimonies = async (req, res) => {
  try {
    const testimonies = await Testimony.find().populate("user", "email");
    res.status(200).json(testimonies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch testimonies", error });
  }
};

// Add a new testimony
exports.addTestimony = async (req, res) => {
  try {
    const newTestimony = new Testimony({
      text: req.body.text,
      user: req.user.id, // User ID from the authenticated user
    });
    await newTestimony.save();
    res.status(201).json(newTestimony);
  } catch (error) {
    res.status(500).json({ message: "Failed to add testimony", error });
  }
};

// Delete a testimony (Admin only)
exports.deleteTestimony = async (req, res) => {
  try {
    const testimony = await Testimony.findByIdAndDelete(req.params.id);
    if (!testimony) return res.status(404).json({ message: "Testimony not found" });

    res.status(200).json({ message: "Testimony deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete testimony", error });
  }
};
