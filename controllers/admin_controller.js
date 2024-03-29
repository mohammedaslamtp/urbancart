const adminHelper = require("../helpers/admin_helper");
const category = require("../models/category_database");
const customers = require("../models/user_database");
const products = require("../models/product_database");
const coupons = require("../models/coupons_database");
/* const Orders = require("../models/orders");
 */

module.exports = {
  /* admin home page */
  admin: async (req, res) => {
    if (req.session.admin) {
      adminHelper.dashboard(req, res);
    } else {
      res.redirect("/admin/adminLogIn");
    }
  },
  /* admin login page */
  adminLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin");
    } else {
      let loginErr = req.session.loggErr;
      req.session.loggErr = null;
      res.render("admin/login", { admin: false, user: false, loginErr });
    }
  },
  /* admin login submition case (examin data) */
  adminSignIn: (req, res) => {
    adminHelper.isAdmin(req.body).then((response) => {
      if (response.status) {
        req.session.admin = response.admin;
        req.session.adminLoggedIn = true;
        req.session.loggErr = null;
        res.redirect("/admin");
      } else {
        req.session.loggErr = "Invalid email or password";
        res.redirect("/admin/adminLogIn");
      }
    });
  },

  /* admin logout */
  adminLogout: (req, res) => {
    req.session.adminLoggedIn = false;
    req.session.destroy();
    res.redirect("/admin/adminLogin");
  },

  /* category management page*/
  category: async (req, res) => {
    let showCategory = await category.find({ access: true });
    console.log("categories : " + showCategory);
    res.render("admin/category_list", {
      user: false,
      admin: true,
      page: "category",
      showCategory
    });
  },
  /* to add a new category */
  addCategory: (req, res) => {
    console.log("input: " + req.file, req.body);
    adminHelper.addNewCategory(req.file, req.body, res, (doc) => {
      console.log(doc);
      res.redirect("/admin/category");
    });
  },
  /* to edit a category */
  editCategory: (req, res) => {
    console.log("input :" + req.file, req.body);
    adminHelper.updateCategory(req, res);
  },

  /* to delete a category */
  deleteCategory: (req, res) => {
    let categoryId = req.params.id;
    adminHelper.delCategory(categoryId).then((response) => {
      res.redirect("/admin/category");
    });
  },

  /* customers management page*/
  customers: async (req, res) => {
    let showUsers = await customers.find();
    res.render("admin/customers", { admin: true, user: false, showUsers, page: "customers" });
  },

  /* to block a user */
  blockUser: (req, res) => {
    adminHelper.blockingUser(req, res, (data) => {
      console.log("User blocking process success ", data);
      res.redirect("/admin/customers");
    });
  },

  /* to unblock a user */
  unblockUser: (req, res) => {
    adminHelper.unblockingUser(req, res, (data) => {
      console.log("User unblocked", data);
      res.redirect("/admin/customers");
    });
  },

  /* products management page */
  products: async (req, res) => {
    let showProducts = await products.find({ access: true }).populate("category");
    let showCategory = await category.find({ access: true });
    res.render("admin/products", {
      admin: true,
      user: false,
      showProducts,
      showCategory,
      page: "products"
    });
  },

  /* to add a new product */
  addProduct: (req, res) => {
    console.log(req.body);
    adminHelper.addNewProduct(req.files, req.body, res, (data) => {
      res.redirect("/admin/products");
    });
  },

  /* to edit a product */
  editProduct: (req, res) => {
    adminHelper.updateProduct(req, res);
  },

  /* to delete a product */
  deleteProduct: (req, res) => {
    adminHelper.removeProduct(req, res);
  },

  /* to view coupons */
  coupons: async (req, res) => {
    let showCoupons = await coupons.find();
    res.render("admin/coupons", { user: false, admin: true, showCoupons, page: "coupons" });
  },

  /* to add a new coupon */
  addCoupon: (req, res) => {
    adminHelper.addCoupon(req, res);
  },

  /* disable coupon */
  disableCoupon: (req, res) => {
    adminHelper.disableCoupon(req, res);
  },

  /* enable coupon */
  enableCoupon: (req, res) => {
    adminHelper.enableCoupon(req, res);
  },

  /* edit coupon */
  editCoupon: (req, res) => {
    adminHelper.editCoupon(req, res);
  },

  // to banners management:
  banners: (req, res) => {
    adminHelper.banners(req, res);
  },

  // to add a new banner:
  addBanner: (req, res) => {
    adminHelper.addBanner(req, res);
  },

  /* to edit a banner */
  editBanner: (req, res) => {
    console.log("input :" + req.file, req.body);
    adminHelper.editBanner(req, res);
  },

  /* to delete a category */
  deleteBanner: (req, res) => {
    let BannerId = req.params.id;
    console.log(req.params);
    console.log("id: ", BannerId);
    adminHelper
      .delBanner(BannerId)
      .then((response) => {
        res.redirect("/admin/banners");
      })
      .catch((err) => {
        res.redirect("/user/404");
      });
  },

  // to orders management:
  orders: (req, res) => {
    adminHelper.orders(req, res);
  },

  // to update order status:
  updateStatus: (req, res) => {
    adminHelper.updateStatus(req, res);
  },

  // to show the ordered products in orders:
  getOrderedProducts: (req, res) => {
    adminHelper.getOrderedProducts(req, res);
  },

  // to get date of sales report:
  salesReportDate: (req, res) => {
    res.render("admin/sales_report_date", { user: false, admin: true, page: "sales" });
  },

  // to get disply sales report:
  toSalesReport: (req, res) => {
    adminHelper.toSalesReport(req, res);
  }
};
