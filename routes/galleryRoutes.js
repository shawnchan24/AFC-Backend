const express = require("express");
const multer = require("multer");
const Photo = require("../models/Photo");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res) => {
  const photos = await Photo.find({ approved: true });
  res.json(photos);
});

router.post("/", upload.single("photo"), async (req, res) => {
  const photo = new Photo({ url: `/uploads/${req.file.filename}` });
  await photo.save();
  res.status(201).json(photo);
});

module.exports = router;
