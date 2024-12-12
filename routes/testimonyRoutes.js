const express = require("express");
const Testimony = require("../models/Testimony");

const router = express.Router();

router.get("/", async (req, res) => {
  const testimonies = await Testimony.find().populate("user");
  res.json(testimonies);
});

router.post("/", async (req, res) => {
  const testimony = new Testimony(req.body);
  await testimony.save();
  res.status(201).json(testimony);
});

module.exports = router;
