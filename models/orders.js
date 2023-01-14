const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "customers",
      required: true
    },
    address: {
      type: mongoose.Types.ObjectId,
      ref: "customers",
      required: true
    },
    cart: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "product",
          required: true
        },
        qty: {
          type: Number,
          required: true
        }
      }
    ],
    nonDiscountedAmount: {
      type: Number
    },
    paymentMethod: {
      type: String,
      required: true
    },
    paymentStatus: String,
    orderStatus: String,
    date: {
      type: Date,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("orders", ordersSchema);
