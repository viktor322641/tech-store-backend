const Order = require("../models/order.model");
const Cart = require("../models/cart.model");

// Function to create a new order
exports.createOrder = async (req, res, next) => {
  try {
    // Log incoming data
    console.log("Request body:", req.body);
    console.log("ShippingAddress:", req.body.shippingAddress);
    console.log("PaymentMethod:", req.body.paymentMethod);

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    console.log("Cart items:", cart.items);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const { shippingAddress, paymentMethod } = req.body;

    // Check for required data
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        message: "Shipping address and payment method are required.",
      });
    }

    // Check for all required shipping address fields
    const requiredAddressFields = ["address", "city", "postalCode", "country"];
    const missingFields = requiredAddressFields.filter(
      (field) => !shippingAddress[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required shipping address fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // Calculate total cart price
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Create array of items with prices
    const orderItems = cart.items.map((item) => {
      console.log("Processing item:", item);
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });
    console.log("Order items:", orderItems);

    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      paymentMethod,
      totalPrice,
      status: "Pending",
    };
    console.log("Order data:", orderData);

    const newOrder = new Order(orderData);
    await newOrder.save();

    // Clear the cart after creating the order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    next(error);
  }
};

// Other controller functions...

// Function to confirm order
exports.confirmOrder = async (req, res, next) => {
  try {
    const userId = req.user._id; // Get user ID from JWT

    // Get cart for current user
    const cart = await Cart.findOne({ userId }).populate("items.product");

    // Return error if cart is empty
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Calculate total cart price
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Create new order with cart data
    const newOrder = new Order({
      user: userId,
      items: cart.items,
      totalPrice,
      address: req.body.address, // User's shipping address
      paymentMethod: req.body.paymentMethod, // Payment method (Credit card etc.)
      status: "Confirmed", // Set order status as "Confirmed"
    });

    // Save order to database
    await newOrder.save();

    // Clear cart after order confirmation
    cart.items = [];
    await cart.save();

    // Send response with order confirmation
    res.status(201).json({
      message: "Order confirmed successfully",
      order: newOrder, // Send order data in response
    });
  } catch (error) {
    next(error); // Forward error to error handling middleware
  }
};

// Function to get user's orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id; // Get user ID from JWT

    // Find all orders for this user
    const orders = await Order.find({ user: userId });

    // If no orders found
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    // Send found orders in response
    res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    next(error); // Forward error to error handling middleware
  }
};

// Function to get specific order status
exports.getOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id; // Get order ID from route parameter

    // Find order by ID
    const order = await Order.findById(orderId);

    // If order not found
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Send order status
    res.status(200).json({
      message: "Order status retrieved successfully",
      status: order.status,
    });
  } catch (error) {
    next(error); // Forward error to error handling middleware
  }
};

// Function to get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};
