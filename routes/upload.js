const express = require("express");
const { v4: uuid } = require("uuid"); 
const router = express.Router();

// AWS S3 is optional - if not configured, return error
router.get("/get/preSignedURL", async (req, res) => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return res.status(503).json({
      error: "AWS S3 not configured. Video upload feature disabled.",
      message: "To enable video uploads, configure AWS S3 credentials in .env file"
    });
  }

  try {
    const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
    const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

    const bucket = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const contentType = req.query.contentType;
    const fileName =
      req.query.fileName.split(".")[0] +
      "-" +
      uuid() +
      "." +
      contentType.split("/")[1];

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "my-learnapp",
      Key: fileName,
      ContentType: contentType,
    });

    const url = await getSignedUrl(bucket, command, { expiresIn: 3600 });
    res.json({
      url,
      fileName,
    });
  } catch (error) {
    console.error("AWS S3 Error:", error);
    res.status(500).json({
      error: "Failed to generate pre-signed URL",
      message: error.message
    });
  }
});

module.exports = router;