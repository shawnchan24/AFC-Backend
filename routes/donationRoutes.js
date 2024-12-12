const express = require("express");
const Donation = require("../models/Donation");

const router = express.Router();

// Add donation
router.post("/", async (req, res) => {
  const { name, email, amount, purpose } = req.body;

  try {
    const donation = new Donation({ name, email, amount, purpose });
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ error: "Error processing donation" });
  }
});

module.exports = router;
