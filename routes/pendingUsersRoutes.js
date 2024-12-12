const express = require("express");
const router = express.Router();
const { getPendingUsers } = require("../controllers/pendingUsersController");

// Define the route to get pending users
router.get("/", getPendingUsers);

module.exports = router;
