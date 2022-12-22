const mongoose = require("mongoose");

const couponsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    discription: {
      type: String,
      required: true
    },
    discount: {
      type: Number,
      required: true
    },
    maxUsage: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    expiry: {
      type: Date,
      required: true
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("coupons", couponsSchema);
