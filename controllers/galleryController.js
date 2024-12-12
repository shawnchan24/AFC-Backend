const Photo = require("../models/Photo");

// Fetch all approved photos
exports.getApprovedPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ approved: true });
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch photos", error });
  }
};

// Upload a new photo (requires admin approval)
exports.uploadPhoto = async (req, res) => {
  try {
    const newPhoto = new Photo({
      url: `/uploads/${req.file.filename}`, // File path from multer
      approved: false, // By default, photos require admin approval
    });
    await newPhoto.save();
    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(500).json({ message: "Failed to upload photo", error });
  }
};

// Approve a photo (Admin only)
exports.approvePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    photo.approved = true;
    await photo.save();
    res.status(200).json({ message: "Photo approved", photo });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve photo", error });
  }
};

// Delete a photo
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    res.status(200).json({ message: "Photo deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete photo", error });
  }
};
