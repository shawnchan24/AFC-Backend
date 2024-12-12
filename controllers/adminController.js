const User = require("../models/User");

exports.approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found");

  user.approved = true;
  await user.save();
  res.status(200).send("User approved");
};
