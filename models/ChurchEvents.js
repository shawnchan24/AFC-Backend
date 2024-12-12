const mongoose = require("mongoose");

const churchEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  media: { type: String }, // Path to video or image
  description: { type: String },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("ChurchEvent", churchEventSchema);
