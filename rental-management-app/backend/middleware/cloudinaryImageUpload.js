// This middleware uploads images to Cloudinary and attaches the URLs to req.body.images
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const fs = require('fs');

async function cloudinaryImageUploadMiddleware(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next();
  }
  try {
    const urls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.path);
      urls.push(url);
      // Remove local file after upload
      fs.unlinkSync(file.path);
    }
    req.body.images = urls;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
  }
}

module.exports = cloudinaryImageUploadMiddleware;
