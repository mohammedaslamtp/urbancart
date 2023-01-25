const admins = require("../models/amdin_database");
const category = require("../models/category_database");
const customers = require("../models/user_database");
const product = require("../models/product_database");
const objId = require("mongoose").Types.ObjectId;
const coupon = require("../models/coupons_database");
const Orders = require("../models/orders");
const Banners = require("../models/banners");

module.exports = {
  /* to check is admin or not when login */
  isAdmin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let admin = await admins.find({ email: adminData.email });
      if (admin.length > 0) {
        if (adminData.password === admin[0].password) {
          response.admin = admin;
          response.status = true;
          resolve(response);
          console.log("admin confirmed");
        } else {
          resolve({ status: false });
          console.log("admin login failed! incorrect email or password!");
        }
      } else {
        resolve({ status: false });
        console.log("admin login failed!!!");
      }
    });
  },

  // to set graph in dashboard:
  dashboard: async (req, res) => {
    try {
      const orders = await Orders.find({});
      let today = new Date();
      let todayStarting = new Date(today.setUTCHours(0, 0, 0, 0));
      let todayEnding = new Date(today.setUTCHours(23, 59, 59, 999));

      // finding today sales count:
      let todaySales = await Orders.countDocuments({
        date: { $gt: todayStarting, $lt: todayEnding },
        orderStatus: { $eq: "Delivered" }
      });
      // finding total
      let totalSales = await Orders.countDocuments({
        orderStatus: { $eq: "Delivered" }
      });

      // today revenue:
      let todayRev = await Orders.aggregate([
        {
          $match: {
            $and: [
              { date: { $gt: todayStarting, $lt: todayEnding } },
              { orderStatus: { $eq: "Delivered" } }
            ]
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            todayRevenue: { $sum: "$total" }
          }
        }
      ]);
      let todayRevenue = 0;
      if (todayRev[0] == undefined || todayRev.length <= 0) {
        todayRevenue = 0;
      } else {
        todayRevenue = todayRev[0].todayRevenue;
      }

      // total revenue:
      let totalRev = await Orders.aggregate([
        {
          $match: {
            orderStatus: { $eq: "Delivered" }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" }
          }
        }
      ]);
      let totalRevenue = totalRev[0].totalRevenue;
      // start of month:
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // end of month:
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      // start of year:
      const startOfYear = new Date();
      startOfYear.setMonth(0);
      startOfYear.setDate(1);
      console.log("start of year: ", startOfYear);

      // end of year:
      const endOfYear = new Date();
      endOfYear.setDate(31);
      endOfYear.setMonth(11);
      endOfYear.setHours(23, 59, 59, 999);
      console.log("end of year: ", endOfYear);

      let salesData = await Orders.aggregate([
        {
          $match: {
            date: {
              $gte: startOfMonth,
              $lt: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      let yearlySales = await Orders.aggregate([
        {
          $match: {
            $and: [
              { orderStatus: "Delivered" },
              {
                date: {
                  $gte: startOfYear,
                  $lt: endOfYear
                }
              }
            ]
          }
        },
        {
          $group: {
            _id: { year: { $year: "$date" }, month: { $month: "$date" } },
            totalSales: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.month": 1 }
        }
      ]);
      res.render("admin/index", {
        user: false,
        admin: true,
        page: "dashboard",
        todaySales,
        todayRevenue,
        totalRevenue,
        totalSales,
        salesData,
        yearlySales
      });
    } catch (err) {
      console.log("Dashboard data finding ERROR! ", err);
      res.redirect("/user/404");
    }
  },

  /* to add new category */
  addNewCategory: (file, data, res, cb) => {
    console.log(file.path);
    let filePath = file.path.substring(6);
    const categoryItem = new category({
      category: data.category,
      discription: data.discription,
      image: filePath
    });
    categoryItem.save((err, doc) => {
      if (err) {
        console.log(err);
        res.redirect("/user/404");
      } else {
        cb(doc);
      }
    });
    console.log("new category item :" + categoryItem);
  },

  /* to update a category */
  updateCategory: (req, res) => {
    let data = req.body;
    let categoryId = req.params.id;
    console.log(data);
    let image = req.file;
    if (image) {
      var imagePath = image.path.substring(6);
      category.findByIdAndUpdate(categoryId, { $set: { image: imagePath } }).then(() => {
        console.log("Category: image upated...");
      });
    }
    category
      .findByIdAndUpdate(
        { _id: categoryId },
        {
          $set: {
            category: data.category,
            discription: data.discription
          }
        }
      )
      .then(() => {
        res.redirect("/admin/category");
      })
      .catch((e) => {
        console.log("Update Category ERROR! ", e);
        res.redirect("/user/404");
      });
  },

  /* to delete a category */
  delCategory: (categoryId) => {
    return new Promise((resolve, reject) => {
      category
        .findByIdAndUpdate({ _id: objId(categoryId) }, { access: false })
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          console.log("Delete Category ERROR! ", e);
          res.redirect("/user/404");
        });
    });
  },

  /* to block a user */
  blockingUser: (req, res, cb) => {
    try {
      let userId = objId(req.params.id);
      customers.findByIdAndUpdate(userId, { access: false }, (err, data) => {
        if (err) {
          console.log("got a error in blocking updation process! " + err);
          res.redirect("/admin/customers");
        } else {
          cb(data);
        }
      });
    } catch (e) {
      console.log("Blocking User ERROR! ", e);
      res.redirect("/user/404");
    }
  },

  /* to unblock a user */
  unblockingUser: (req, res, cb) => {
    try {
      let userId = objId(req.params.id);
      customers.findByIdAndUpdate(userId, { access: true }, (err, data) => {
        if (err) {
          console.log("got a error in unblocking updation process! " + err);
          res.redirect("/admin/customers");
        } else {
          cb(data);
        }
      });
    } catch (e) {
      console.log("Unblocking User ERROR! ", e);
      res.redirect("/user/404");
    }
  },

  /* to add a new product */
  addNewProduct: (files, newData, res, cb) => {
    try {
      let imagePath = {};
      for (let i = 0; i < files.length; i++) {
        imagePath[i] = files[i].path.substring(6);
      }
      const newProduct = new product({
        brand: newData.brand,
        tittle: newData.tittle,
        category: newData.category,
        price: newData.price,
        discount: newData.discount,
        discription: newData.discription,
        stock: newData.stock,
        images: imagePath
      });
      newProduct.save((err, data) => {
        if (err) {
          console.log(err);
          res.redirect("/admin/products");
        } else {
          cb(data);
        }
      });
      console.log("new product added: " + newProduct);
    } catch (e) {
      console.log("Add New Category ERROR! ", e);
      res.redirect("/user/404");
    }
  },

  /* to edit or update a product */
  updateProduct: (req, res) => {
    let newData = req.body;
    let files = req.files;
    let productId = req.params.id;
    if (files.length > 0) {
      var imagePaths = {};
      for (let i = 0; i < files.length; i++) {
        imagePaths[i] = files[i].path.substring(6);
      }
      product.findByIdAndUpdate(productId, { $set: { images: imagePaths } }).then(() => {
        console.log("Product: images uploaded...");
      });
    }
    product
      .findByIdAndUpdate(
        { _id: productId },
        {
          $set: {
            brand: newData.brand,
            tittle: newData.tittle,
            category: newData.category,
            price: newData.price,
            discount: newData.discount,
            discription: newData.discription,
            stock: newData.stock
          }
        }
      )
      .then(() => {
        console.log("Product edited");
        res.redirect("/admin/products");
      })
      .catch((e) => {
        console.log("Update Product ERROR! ", e);
        res.redirect("/user/404");
      });
  },

  /* to remove a product */
  removeProduct: (req, res) => {
    console.log("entered to remove Product...");
    return new Promise((resolve, reject) => {
      const productId = req.params.id;
      console.log(productId);
      product
        .findByIdAndUpdate({ _id: productId }, { access: false })
        .then((response) => {
          console.log(response);
          res.redirect("/admin/products");
        })
        .catch((e) => {
          console.log("Remove Product ERROR! ", e);
          res.redirect("/user/404");
        });
    });
  },

  /* to add a coupon */
  addCoupon: (req, res) => {
    let inputData = req.body;
    let newCoupon = new coupon({
      name: inputData.name.trim(),
      discription: inputData.discription,
      discount: inputData.discount,
      minCartAmount: inputData.minCartAmount,
      startDate: inputData.startDate,
      expiry: inputData.expiry
    });
    newCoupon.save((err, data) => {
      if (err) {
        console.log(err);
        res.redirect("/user/404");
        console.log("Add coupon ERROR! ", err);
      } else {
        res.redirect("/admin/coupons");
      }
    });
  },

  /* to disable a coupon */
  disableCoupon: (req, res) => {
    let couponId = req.params.id;
    coupon
      .findByIdAndUpdate(couponId, { $set: { status: false } })
      .then(() => {
        res.redirect("/admin/coupons");
      })
      .catch((e) => {
        console.log("Disable coupon ERROR! ", e);
        res.redirect("/user/404");
      });
  },

  /* to enable a coupon */
  enableCoupon: (req, res) => {
    let couponId = req.params.id;
    coupon
      .findByIdAndUpdate(couponId, { $set: { status: true } })
      .then(() => {
        res.redirect("/admin/coupons");
      })
      .catch((e) => {
        console.log("Enable Coupon ERROR! ", e);
        res.redirect("/user/404");
      });
  },

  /* to edit a coupon */
  editCoupon: (req, res) => {
    let couponId = req.params.id;
    let data = req.body;

    coupon
      .findByIdAndUpdate(
        { _id: couponId },
        {
          $set: {
            name: data.name,
            discription: data.discription,
            discount: data.discount,
            minCartAmount: data.minCartAmount,
            startDate: data.startDate,
            expiry: data.expiry
          }
        }
      )
      .then(() => {
        res.redirect("/admin/coupons");
      })
      .catch((e) => {
        console.log("Edit coupon ERROR! ", e);
        res.redirect("/user/404");
      });
  },

  // to banner management:
  banners: async (req, res) => {
    let banners = await Banners.find({ access: true });
    res.render("admin/banners", { user: false, admin: true, banners, page: "banners" });
  },

  // to add a banner:
  addBanner: (req, res) => {
    let filePath = req.file.path.substring(6);
    const banner = new Banners({
      title: req.body.title,
      description: req.body.description,
      url: req.body.url.replace(/\s+/g, ""),
      image: filePath
    });
    banner.save((err, doc) => {
      if (err) {
        console.log(err);
      } else {
        console.log("banner added successfully..");
        console.log(doc);
        res.redirect("/admin/banners");
      }
    });
  },

  // to update a banner:
  editBanner: (req, res) => {
    let data = req.body;
    let url = req.body.url.replace(/\s+/g, "");
    let bannerId = req.params.id;
    let image = req.file;
    if (image) {
      var imagePath = image.path.substring(6);
      Banners.findByIdAndUpdate(bannerId, { $set: { image: imagePath } }).then(() => {});
    }
    Banners.findByIdAndUpdate(
      { _id: bannerId },
      {
        $set: {
          title: data.title,
          description: data.description,
          url: url
        }
      }
    ).then(() => {
      res.redirect("/admin/banners");
    });
  },

  /* to delete a category */
  delBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      Banners.findByIdAndUpdate({ _id: objId(bannerId) }, { access: false })
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          console.log("banner deletion ERROR! ", err);
          res.redirect("/user/404");
        });
    });
  },

  // to show the ordered products in orders:
  getOrderedProducts: async (req, res) => {
    try {
      let orderId = req.body.orderId;
      let orders = await Orders.find().populate("user").populate("cart.productId");
      console.log("orders: ", orders);
    } catch (err) {
      console.log("get Ordered Products ERROR!", err);
      res.redirect("/user/404");
    }
  },

  // to orders management:
  orders: async (req, res) => {
    let orders = await Orders.find().populate("user").populate("cart.productId");
    orders = orders.reverse();
    console.log('ord-----> ',orders)
    res.render("admin/orders", { admin: true, orders, user: false, page: "orders" });
  },

  // to update order status:
  updateStatus: (req, res) => {
    try {
      let newStatus = req.body.newStatus;
      let orderId = req.body.orderId;
      Orders.findOneAndUpdate(
        { _id: orderId },
        { $set: { orderStatus: newStatus } },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log("new order status updation failed! ", err);
          } else {
            console.log("new order updation successful..");
            console.log(doc);
            res.json({ current_status: doc.orderStatus, status: true });
          }
        }
      );
    } catch (e) {
      console.log("Status updation ERROR!", e);
      res.redirect("/user/404");
    }
  },

  // to show sales report:
  toSalesReport: async (req, res) => {
    try {
      let orders = await Orders.find();
      let salesData = await Orders.aggregate([
        {
          $match: {
            orderStatus: { $eq: "Delivered" },
            $and: [
              { date: { $gt: new Date(req.body.fromDate) } },
              { date: { $lt: new Date(req.body.toDate) } }
            ]
          }
        },
        {
          $lookup: {
            from: "customers",
            localField: "user",
            foreignField: "_id",
            as: "userData"
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);
      res.render("admin/", {
        user: false,
        admin: true,
        salesData,
        page: "sales_report"
      });
    } catch (e) {
      console.log("ERROR!! ", e);
      res.redirect("/user/404");
    }
  }
};
