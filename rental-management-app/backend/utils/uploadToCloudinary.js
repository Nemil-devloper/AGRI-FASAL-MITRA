// Utility to upload images to Cloudinary
const cloudinary = require('./cloudinary');

async function uploadToCloudinary(filePath, folder = 'equipment') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
}

module.exports = uploadToCloudinary;
