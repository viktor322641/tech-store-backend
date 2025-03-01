const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// Function to format image URL
const formatImageUrl = (product) => {
  if (product.image) {
    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    product.imageUrl = `${baseUrl}/uploads/products/${product.image}`;
  }
  return product;
};

// Get the user's cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart) {
      return res.status(200).json({ items: [], message: "Cart is empty" });
    }

    // Format image URLs for all products in the cart
    const formattedCart = {
      ...cart.toObject(),
      items: cart.items.map((item) => ({
        ...item.toObject(),
        product: formatImageUrl(item.product.toObject()),
      })),
    };

    res.status(200).json(formattedCart);
  } catch (error) {
    next(error);
  }
};

// Add a product to the cart
exports.addToCart = async (req, res, next) => {
  try {
    console.log("Adding to cart:", {
      user: req.user,
      body: req.body,
      headers: req.headers,
    });

    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Get updated cart with populated product data
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    // Format image URLs
    const formattedCart = {
      ...populatedCart.toObject(),
      items: populatedCart.items.map((item) => ({
        ...item.toObject(),
        product: formatImageUrl(item.product.toObject()),
      })),
    };

    res.status(201).json(formattedCart);
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove a product from the cart
exports.removeFromCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// Update the quantity of a product in the cart
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    console.log("Updating cart item:", { itemId, quantity, body: req.body });

    if (!quantity || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity === 0) {
      // If quantity is 0, remove the item
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    } else {
      cartItem.quantity = quantity;
    }

    await cart.save();

    // Get updated cart with product data
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    // Format image URLs
    const formattedCart = {
      ...populatedCart.toObject(),
      items: populatedCart.items.map((item) => ({
        ...item.toObject(),
        product: formatImageUrl(item.product.toObject()),
      })),
    };

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove an item from the cart
exports.removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    console.log("Removing cart item:", { itemId });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    // Get updated cart with product data
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    // Format image URLs
    const formattedCart = {
      ...populatedCart.toObject(),
      items: populatedCart.items.map((item) => ({
        ...item.toObject(),
        product: formatImageUrl(item.product.toObject()),
      })),
    };

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: error.message });
  }
};
