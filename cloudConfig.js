const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

// Configure Cloudinary only if env vars are present
if (CLOUD_NAME && CLOUD_API_KEY && CLOUD_API_SECRET) {
  cloudinary.config({
      cloud_name:CLOUD_NAME,
      api_key:CLOUD_API_KEY,
      api_secret:CLOUD_API_SECRET,
  });
}


let storage;
if (CLOUD_NAME && CLOUD_API_KEY && CLOUD_API_SECRET) {
  storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'wanderlust_DEV',
        allowed_formats: ['png', 'jpg', 'jpeg'], 
      },
    });
} else {
  // Fallback to in-memory storage when Cloudinary is not configured
  // This avoids runtime crashes; controller will assign a placeholder image
  storage = multer.memoryStorage();
}

  module.exports = {
    cloudinary,
    storage,
  }