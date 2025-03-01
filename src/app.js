const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/error.middleware");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Connect to database
connectDB();

// Move CORS to the beginning, before all middleware
const corsOptions = {
  origin: ["http://localhost:3000", "https://tech-store-fronend.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["set-cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS before all other middleware
app.use(cors(corsOptions));

// Add preflight for all routes
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files middleware
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Add middleware for logging image requests
app.use("/uploads", (req, res, next) => {
  console.log("Image request:", {
    url: req.url,
    path: path.join(__dirname, "../uploads", req.url),
    exists: require("fs").existsSync(
      path.join(__dirname, "../uploads", req.url)
    ),
  });
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Request headers:", req.headers);
  next();
});

// Add before all routes
app.use((req, res, next) => {
  console.log("Request:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Add logging for CORS debugging
app.use((req, res, next) => {
  console.log("CORS Headers:", {
    origin: req.headers.origin,
    method: req.method,
    authorization: req.headers.authorization ? "Present" : "Not present",
  });
  next();
});

// Routes imports
const productRoutes = require("./routes/product.routes"); // Import product routes
const cartRoutes = require("./routes/cart.routes"); // Import cart routes
const orderRoutes = require("./routes/order.routes"); // Import order routes
const authRoutes = require("./routes/auth.routes"); // Import authentication routes

// Register routes
app.use("/api/auth", authRoutes); // Routes for authentication
app.use("/api/products", productRoutes); // Routes for product operations
app.use("/api/cart", cartRoutes); // Routes for cart operations
app.use("/api/orders", orderRoutes); // Routes for order operations

// Test routes
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "API is working successfully!" });
});

app.get("/api/test-cors", (req, res) => {
  res.json({
    message: "CORS is working",
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/debug-cors", (req, res) => {
  res.json({
    message: "CORS check successful",
    headers: req.headers,
    origin: req.get("origin"),
    host: req.get("host"),
  });
});

app.get("/api/test-image", (req, res) => {
  const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
  res.json({
    message: "Image URL test",
    sampleImageUrl: `${baseUrl}/uploads/products/Sony-FX-3.jpg`,
    baseUrl: baseUrl,
    env: process.env.NODE_ENV,
  });
});

app.get("/api/auth-test", (req, res) => {
  res.json({
    message: "Auth test",
    headers: req.headers,
    user: req.user,
  });
});

// Error Handler
app.use(errorHandler);

// 404 Handler - Moved to the end
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
