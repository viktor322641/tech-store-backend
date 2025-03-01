const validateImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (req.file.size > maxSize) {
    return res.status(400).json({
      message: "Image size should not exceed 5MB",
    });
  }

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      message: "Only JPG, PNG and WebP images are allowed",
    });
  }

  next();
};

module.exports = validateImage;
