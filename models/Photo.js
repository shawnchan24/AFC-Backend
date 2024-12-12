const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: String,
  approved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Photo", photoSchema);
