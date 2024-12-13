const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is mandatory
    trim: true, // Remove extra spaces
  },
  date: {
    type: Date, // Ensure the date is stored as a proper Date object
    required: true, // Date is mandatory
  },
  description: {
    type: String,
    required: true, // Description is mandatory
    trim: true, // Remove extra spaces
  },
  mediaUrl: {
    type: String, // URL for event media like photos or videos
    required: true, // Media URL is mandatory
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set creation date
  },
});

module.exports = mongoose.model("Event", eventSchema);
