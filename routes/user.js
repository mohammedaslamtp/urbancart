const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  home,
  userSignUp,
  userLogIn,
  userLogOut,
  generateOtp,
  products,
  productSearching,
  productDetail,
  userCart,
  addToCart,
  changeQuantity,
  wishlist,
  addToWishlist,
  removeWishlistItem,
  userProfile,
  userAddress,
  editDetails,
  changeUserPassword,
  addAddress,
  editAddress,
  deleteAddress,
  checkout,
  couponGenerate,
  placeOrder,
  orderSuccess,
  verifyPayment,
  orders,
  cancelOrder
} = require("../controllers/user_controller");
const userDataBase = require("../models/user_database");

router.use(async (req, res, next) => {
  if (req.session.user) {
    req.session.user = await userDataBase.findOne({ _id: req.session.user._id });
  }
  next();
});
router.get("/", home);
router.get("/login", login);
router.get("/signup", signup);
router.post("/userSignUp", userSignUp);
router.post("/userLogIn", userLogIn);
router.get("/userLogOut", userLogOut);
router.post("/generateOtp", generateOtp);
router.get("/products", products);
router.get("/productSearching", productSearching);
router.get("/productDetail/:id", productDetail);
router.get("/userCart", userCart);
router.post("/addToCart/:id", addToCart);
router.post("/changeQuantity", changeQuantity);
router.get("/wishlist", wishlist);
router.post("/addToWishlist", addToWishlist);
router.post("/removeWishlistItem", removeWishlistItem);
router.get("/userProfile", userProfile);
router.get("/userAddress", userAddress);
router.post("/editDetails", editDetails);
router.post("/changeUserPassword", changeUserPassword);
router.post('/addAddress',addAddress)
router.post("/editAddress", editAddress);
router.post("/deleteAddress", deleteAddress);
router.get("/checkout", checkout);
router.post("/couponGenerate", couponGenerate);
router.post("/placeOrder", placeOrder);
router.get("/orderSuccess", orderSuccess);
router.post("/verifyPayment", verifyPayment);
router.get("/orders", orders);
router.post("/cancelOrder", cancelOrder);


module.exports = router;