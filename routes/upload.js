const express = require("express");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload video to Cloudinary
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "learnify/videos",
        public_id: `${uuid()}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).json({ error: "Failed to upload video" });
        }
        res.json({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl: result.thumbnail_url,
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
});

module.exports = router;