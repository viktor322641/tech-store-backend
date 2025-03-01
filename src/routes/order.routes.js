const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderStatus,
  getOrderById,
  confirmOrder,
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");
console.log("createOrder imported:", createOrder);
console.log("confirmOrder imported:", confirmOrder);
// Route to confirm an order (POST method)
router.post("/confirm", protect, confirmOrder); // Create a route for confirming an order

// Route to create a new order
router.post("/", protect, createOrder);

// Route to get all orders of the authenticated user
router.get("/", protect, getUserOrders);

// Route to get the status of a specific order
router.get("/:id/status", protect, getOrderStatus);

// Route to get a specific order by ID
router.get("/:id", protect, getOrderById);

module.exports = router;
// В файле order.routes.js
