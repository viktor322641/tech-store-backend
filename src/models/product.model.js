const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: function (doc, ret) {
        if (ret.image) {
          const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
          ret.imageUrl = `${baseUrl}/uploads/products/${ret.image}`;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: function (doc, ret) {
        if (ret.image) {
          const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
          ret.imageUrl = `${baseUrl}/uploads/products/${ret.image}`;
        }
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Product", productSchema);
