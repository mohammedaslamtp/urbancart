const express = require("express");
const router = express.Router();
const fileUpload = require("../middleware/multer");

const {
  admin,
  adminLogin,
  adminSignIn,
  adminLogout,
  category,
  addCategory,
  deleteCategory,
  editCategory,
  customers,
  blockUser,
  unblockUser,
  products,
  addProduct,
  editProduct,
  deleteProduct,
  coupons,
  addCoupon,
  disableCoupon,
  enableCoupon,
  editCoupon,
  orders,
  updateStatus,
  getOrderedProducts,
  salesReportDate,
  toSalesReport,
  banners,
  addBanner,
  editBanner,
  deleteBanner
} = require("../controllers/adminController");

router.get("/", admin);
router.get("/adminLogin", adminLogin);
router.post("/adminSignIn", adminSignIn);
router.get("/adminLogout", adminLogout);
router.get("/category", category);
router.post("/addCategory", fileUpload.single("image"), addCategory);
router.post("/editCategory/:id", fileUpload.single("image"), editCategory);
router.get("/deleteCategory/:id", deleteCategory);
router.get("/customers", customers);
router.get("/blockUser/:id", blockUser);
router.get("/unblockUser/:id", unblockUser);
router.get("/products", products);
router.post("/addProduct", fileUpload.array("images"), addProduct);
router.post("/editProduct/:id", fileUpload.array("images"), editProduct);
router.get("/deleteProduct/:id", deleteProduct);
router.get("/coupons", coupons);
router.post("/addCoupon", addCoupon);
router.get("/disableCoupon/:id", disableCoupon);
router.get("/enableCoupon/:id", enableCoupon);
router.post("/editCoupon/:id", editCoupon);
router.get("/orders", orders);
router.post("/updateStatus", updateStatus);
router.get("/getOrderedProducts", getOrderedProducts);
router.get("/salesReportDate", salesReportDate);
router.post("/toSalesReport", toSalesReport);
router.get("/banners", banners);
router.post("/addBanner", fileUpload.single("image"), addBanner);
router.post("/editBanner/:id", fileUpload.single("image"), editBanner);
router.get("/deleteBanner/:id", deleteBanner);

module.exports = router;
