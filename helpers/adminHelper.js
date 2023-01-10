const admins = require("../models/amdinDataBase");
const category = require("../models/categoryDataBase");
const customers = require("../models/userDataBase");
const product = require("../models/productDataBase");
const objId = require("mongoose").Types.ObjectId;
const coupon = require("../models/couponsDataBase");

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

  /* to add new category */
  addNewCategory: (file, data, res, cb) => {
    console.log(file.path);
    let filePath = file.path.substring(6);
    console.log("filePath  : " + filePath);
    const categoryItem = new category({
      category: data.category,
      discription: data.discription,
      image: filePath
    });
    categoryItem.save((err, doc) => {
      if (err) {
        console.log(err);
        res.redirect("/admin/category");
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
    console.log("category id: " + categoryId);
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
      });
  },

  /* to delete a category */
  delCategory: (categoryId) => {
    return new Promise((resolve, reject) => {
      category.findByIdAndUpdate({ _id: objId(categoryId) },{access:false}).then((response) => {
        resolve(response);
      });
    });
  },

  /* to block a user */
  blockingUser: (req, res, cb) => {
    let userId = objId(req.params.id);
    customers.findByIdAndUpdate(userId, { access: false }, (err, data) => {
      if (err) {
        console.log("got a error in blocking updation process! " + err);
        res.redirect("/admin/customers");
      } else {
        cb(data);
      }
    });
  },

  /* to unblock a user */
  unblockingUser: (req, res, cb) => {
    let userId = objId(req.params.id);
    customers.findByIdAndUpdate(userId, { access: true }, (err, data) => {
      if (err) {
        console.log("got a error in unblocking updation process! " + err);
        res.redirect("/admin/customers");
      } else {
        cb(data);
      }
    });
  },

  /* to add a new product */
  addNewProduct: (files, newData, res, cb) => {
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
      });
  },

  /* to remove a product */
  removeProduct: (req, res) => {
    console.log("entered to remove Product...");
    return new Promise((resolve, reject) => {
      const productId = req.params.id;
      console.log(productId);
      product.findByIdAndUpdate({_id:productId},{access:false}).then((response) => {
        console.log(response);
        res.redirect("/admin/products");
      });
    });
  },

  /* to add a coupon */
  addCoupon: (req, res) => {
    let inputData = req.body;
    let newCoupon = new coupon({
      name: inputData.name,
      discription: inputData.discription,
      discount: inputData.discount,
      maxUsage: inputData.maxUsage,
      startDate: inputData.startDate,
      expiry: inputData.expiry
    });
    newCoupon.save((err, data) => {
      if (err) {
        console.log(err);
        res.redirect("/admin/coupons");
      } else {
        res.redirect("/admin/coupons");
      }
    });
  },

  /* to disable a coupon */
  disableCoupon: (req, res) => {
    let couponId = req.params.id;
    coupon.findByIdAndUpdate(couponId, { $set: { status: false } }).then(() => {
      res.redirect("/admin/coupons");
    });
  },

  /* to enable a coupon */
  enableCoupon: (req, res) => {
    let couponId = req.params.id;
    coupon.findByIdAndUpdate(couponId, { $set: { status: true } }).then(() => {
      res.redirect("/admin/coupons");
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
            maxUsage: data.maxUsage,
            startDate: data.startDate,
            expiry: data.expiry
          }
        }
      )
      .then(() => {
        res.redirect("/admin/coupons");
      });
  }
};
