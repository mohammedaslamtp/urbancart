const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true
    },
    tittle: {
      type: String,
      index:true,
      requried: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      requried: true
    },
    price: {
      type: Number,
      requried: true
    },
    discount: {
      type: String,
      required: true
    },
    discription: {
      type: String,
      requried: true
    },
    stock: {
      type: Number,
      requried: true
    },
    images: {
      type: Object,
      requried: true
    },
    access: {
      type: Boolean,
      default:true
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("product", productSchema);
