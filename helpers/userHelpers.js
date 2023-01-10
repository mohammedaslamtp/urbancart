const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/userDataBase");
const category = require("../models/categoryDataBase");
const products = require("../models/productDataBase");
const { count } = require("../models/userDataBase");
const objId = require("mongoose").Types.ObjectId;

module.exports = {
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await User.findOne({ email: userData.email });

      if (user && user.access) {
        bcrypt.compare(userData.nPassword, user.nPassword).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed! incorrect password!");
            resolve({ status: false });
          }
        });
      } else {
        if (user.access == false) {
          resolve({ status: false, access: false });
          console.log("You are blocked!");
        } else {
          console.log("login failed!");
          resolve({ status: false });
        }
      }
    });
  },

  /* This is for product searching */
  searching: async (req, res) => {
    let proKey = req.query.category;
    let allProducts = await products.find({
      tittle: { $regex: new RegExp("^" + proKey + ".*", "i") }
    });
    res.json(allProducts);
  },

  cartCount: 0,

  /* here is cart page */
  cart: async (req, res) => {
    let showCategory = await category.find({ access: true });
    let users = req.session.user;
    let userId = req.session.user._id;
    let cartUser = await User.findById(userId);
    cartUser
      .populate("cart.items.productId")
      .execPopulate()
      .then((user) => {
        let cartItems = user.cart;
        cartCount = cartItems.items.length;
        console.log("cart items length : " + cartItems.items.length);
        console.log("user data: " + user);
        console.log("user cart items: " + user.cart);
        res.render("user/usersCart", {
          user: true,
          admin: false,
          showCategory,
          users,
          cartItems,
          cartCount,
          page: "cart"
        });
      })
      .catch((e) => {
        console.log("ERROR!! " + e);
      });
  },

  /* to add product to cart */
  addToCart: async (req, res) => {
    try {
      let proId = req.params.id;
      let userId = req.session.user._id;
      let cartUser = await User.findById({ _id: userId });
      products
        .findById({ _id: proId })
        .then((product) => {
          cartUser.addItemToCart(product).then((result) => {
            res.json({
              success: true,
              cartlength: req.session.user.cart.items.length + 1
            });
            console.log(req.session.user.cart.items.length);
          });
        })
        .catch((e) => {
          console.log("ERROR!! " + e);
          res.json({
            success: false,
            cartlength: 0
          });
        });
    } catch (err) {
      console.log("ERROR IN ADD TO CART!! " + err);
    }
  },
  /* to change the cart item quantity */
  changeQuantity: async (req, res) => {
    try {
      let count = parseInt(req.body.count);
      let userId = req.session.user._id;
      let cartUser = await User.findById({ _id: userId });

      await products.findById(req.body.productId).then((item) => {
        cartUser.changeQuantity(item, count, userId, (response) => {
          res.json(response);
        });
      });
    } catch (err) {
      console.log("ERROR....!!! " + err);
    }
  },

  /* wishlist */
  wishlist: async (req, res) => {
    try {
      let showCategory = await category.find({ access: true });
      let users = req.session.user;
      let userId = req.session.user._id;
      let user = await User.findById(userId);
      console.log("whishlist items: " + user.wishlist.items);

      user
        .populate("wishlist.items.productId")
        .execPopulate()
        .then((user) => {
          let wishlistItems = user.wishlist;
          res.render("user/wishlist", {
            user: true,
            admin: false,
            showCategory,
            users,
            wishlistItems,
            page: "wishlist"
          });
        });
    } catch (err) {
      console.log("Wishlist render error! " + err);
    }
  },

  /* add item to wishlist */
  addToWishlist: async (req, res) => {
    try {
      let productId = objId(req.body.productId);
      console.log("prod id: " + productId);
      let userId = req.session.user._id;
      let user = await User.findById({ _id: userId });
      console.log("user: " + user);
      if (req.session.user) {
        User.findById({ _id: userId })
          .then((userId) => {
            user.addToWishlist(productId, (response) => {
              res.json(response);
            });
          })
          .catch((e) => {
            console.log("ERROR!! " + e);
            res.json({
              success: false,
              length: 0
            });
          });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      console.log("ERROR! " + err);
    }
  },

  /* to remove a item from wishlist */
  removeWishlistItem: async (req, res) => {
    try {
      let userId = req.session.user._id;
      console.log("user id: " + userId);
      /* let productId = req.body.productId;
      console.log("product id: " + productId); */
      const user = await User.findById(userId);
      console.log("user: " + user);
      await products.findById(req.body.productId).then((item) => {
        user.removeWishlistItem(item._id, (response) => {
          console.log("deletion " + response.isDeleted);
          res.json(response);
        });
      });
    } catch (error) {
      console.log("wishlist remove ERROR!! " + error);
    }
  },

  /* user details edit */
  editUserDetails: async (req, res) => {
    console.log("id: " + req.session.user._id);
    console.log(req.body);
    let userId = req.session.user._id;
    let phone = parseInt(req.body.phone);
    let user = await User.findOneAndUpdate(
      { _id: userId },
      { fullName: req.body.fullName, email: req.body.emailAddress, phone: phone },
      function (err, docs) {
        if (err) {
          console.log("Updation ERROR! " + err);
        } else {
          console.log("data updated " + docs);
        }
      }
    );
    user.save((err, data) => {
      if (err) {
        console.log("data saving ERROR! " + err);
        res.json({
          success: false
        });
      } else {
        console.log("data saving successful! " + data);
        res.json({
          success: true,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone
        });
      }
    });
  },

  /* to change password using user details section */
  changeUserPassword: async (req, res) => {
    console.log(req.body);
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;
    let user = await User.findById(req.session.user._id);
    bcrypt.compare(req.body.currentPassword, user.nPassword).then(async (status) => {
      if (status) {
        console.log("Password is correct..");
        newPassword = await bcrypt.hash(newPassword, 10);
        confirmPassword = await bcrypt.hash(confirmPassword, 10);
        await user.updateOne({ nPassword: newPassword }, { cPassword: confirmPassword });
        user.save((err, doc) => {
          if (err) {
            console.log("password changing ERROR! " + err);
          } else {
            res.json({ success: true });
            console.log("password changing successful...");
          }
        });
      } else {
        res.json({ success: false });
        console.log("incorrect password!");
      }
    });
  },

  /* to add a new address */
  addAddress: async (req, res) => {
    let dataToAddress = {
      fullName: req.body.fullName,
      mobile: req.body.mobile,
      pincode: req.body.pincode,
      state: req.body.state,
      district: req.body.district,
      country: req.body.country,
      landMark: req.body.landMark,
      city: req.body.city
    };
    console.log("data: " + dataToAddress);
    console.log(req.body);
    User.findOneAndUpdate(
      { _id: req.session.user._id },
      { $push: { addresses: dataToAddress }, $set: { updated: Date.now() } },
      { returnNewDocument: true }
    )
      .then((data) => {
        console.log("Address added successfully");
        console.log("data " + data);
        res.json({ success: true });
      })
      .catch((error) => {
        console.log("address insertion error! " + error);
      });
  },

  //to edit address
  editAddress: async (req, res) => {
    let addressId = req.body.addressId;
    let formData = req.body.data;
    let user = await User.updateOne(
      { _id: req.session.user._id, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.fullName": formData.fullName,
          "addresses.$.mobile": formData.mobile,
          "addresses.$.pincode": formData.pincode,
          "addresses.$.state": formData.state,
          "addresses.$.district": formData.district,
          "addresses.$.country": formData.country,
          "addresses.$.landMark": formData.landMark,
          "addresses.$.city": formData.city
        }
      }
    )
      .then((data) => {
        console.log("address edition success " + data);
      })
      .catch((e) => {
        console.log("address edition error! " + e);
      });
  },

  // to delete a user address
  deleteAddress: async (req, res) => {
    let addressId = req.body.addressId;
    await User.updateOne(
      { _id: req.session.user._id, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.isDeleted": true
        }
      }
    )
      .then((data) => {
        console.log("address deleted");
      })
      .catch((e) => {
        console.log("address deletion failed!");
      });
  }
};
