const User = require("../models/User"); // Import the User model

// Get Pending Users
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false }); // Query for unapproved users
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).send("Error fetching pending users.");
  }
};

module.exports = {
  getPendingUsers,
};
