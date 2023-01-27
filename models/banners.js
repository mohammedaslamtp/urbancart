const mongoose = require("mongoose");

const bannersSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  access: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("banners",bannersSchema);
