const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    phone: {
      type: Number,
      required: true
    },
    nPassword: {
      type: String,
      required: true
    },
    cPassword: {
      type: String,
      required: true
    },
    access: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("customers", userSchema);
