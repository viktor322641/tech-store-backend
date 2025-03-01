const fs = require("fs");
const path = require("path");

const cleanupUnusedImages = async (productsWithImages) => {
  const uploadsDir = path.join(__dirname, "../../uploads/products");

  // Get all files in directory
  const files = fs.readdirSync(uploadsDir);

  // Create Set of used images
  const usedImages = new Set(productsWithImages.map((p) => p.image));

  // Remove unused files
  files.forEach((file) => {
    if (!usedImages.has(file)) {
      const filePath = path.join(uploadsDir, file);
      fs.unlinkSync(filePath);
      console.log(`Removed unused image: ${file}`);
    }
  });
};

module.exports = cleanupUnusedImages;
