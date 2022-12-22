const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    requried: true
  }
});
module.exports = mongoose.model("admins", adminSchema);
