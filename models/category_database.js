const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true
  },
  discription: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  access: {
    type:Boolean,
    default: true
  }
});
module.exports = mongoose.model("category", categorySchema);