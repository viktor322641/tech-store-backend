const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

// Add logging for debugging
router.use((req, res, next) => {
  console.log("Cart route accessed:", {
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params,
  });
  next();
});

// Route to get the user's cart
router.get("/", protect, cartController.getCart);

// Route to add a product to the cart
router.post("/add", protect, cartController.addToCart);

// Route to update the quantity of a product in the cart
router.put("/item/:itemId", protect, cartController.updateCartItem);

// Route to remove a product from the cart
router.delete("/item/:itemId", protect, cartController.removeCartItem);

module.exports = router;
