const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  approved: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
