const express = require("express");
const userHelpers = require("../helpers/userHelpers");
const router = express.Router();
const {
  login,
  signup,
  home,
  userSignUp,
  userLogIn,
  userLogOut,
  generateOtp
} = require("../controllers/userController");

router.get("/", home);
router.get("/login", login);
router.get("/signup", signup);
router.post("/userSignUp", userSignUp);
router.post("/userLogIn", userLogIn);
router.get("/userLogOut", userLogOut);
router.post("/generateOtp", generateOtp);

module.exports = router;
