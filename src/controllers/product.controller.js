const Product = require("../models/product.model");
const path = require("path");

// Получить все товары с пагинацией
exports.getProducts = async (req, res) => {
  try {
    console.log("Getting products, query:", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);

    console.log(`Found ${products.length} products`);

    // Используем BACKEND_URL из переменных окружения
    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    console.log("Using baseUrl:", baseUrl); // Для отладки

    const productsWithUrls = products.map((product) => {
      const productObj = product.toObject();

      if (product.image) {
        const imagePath = path.join(
          __dirname,
          "../../uploads/products",
          product.image
        );
        const imageExists = require("fs").existsSync(imagePath);
        console.log(
          `Image ${product.image} exists: ${imageExists}, path: ${imagePath}`
        );

        // Всегда используем BACKEND_URL для изображений
        productObj.imageUrl = `${baseUrl}/uploads/products/${product.image}`;
      } else {
        productObj.imageUrl = null; // Позволим фронтенду решить, какой placeholder использовать
      }

      return productObj;
    });

    // Логируем первый продукт для проверки
    console.log("First product:", {
      name: productsWithUrls[0]?.name,
      imageUrl: productsWithUrls[0]?.imageUrl,
    });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      products: productsWithUrls,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ message: error.message });
  }
};

// Получить товар по slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";

    const productWithUrl = {
      ...product.toObject(),
      imageUrl: product.image
        ? `${baseUrl}/uploads/products/${product.image}`
        : "",
    };

    res.json(productWithUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
