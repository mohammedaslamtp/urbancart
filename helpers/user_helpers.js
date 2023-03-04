const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const User = require("../models/user_database");
const category = require("../models/category_database");
const products = require("../models/product_database");
const Coupon = require("../models/coupons_database");
const { count } = require("../models/user_database");
const Orders = require("../models/orders");
const objId = require("mongoose").Types.ObjectId;
// razorpay instance:
var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRET_KEY
});

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
        res.render("user/users_cart", {
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
    console.log("edit address calling....");
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
  },
  checkout: async (req, res) => {
    let showCategory = await category.find({ access: true });
    let user = await User.findById(req.session.user._id);
    let addresses = user.addresses;
    let noneDeletedAddresses = [];
    addresses.forEach((el, index) => {
      if (el.isDeleted == false) {
        noneDeletedAddresses.push(el);
      }
    });
    user
      .populate("cart.items.productId")
      .execPopulate()
      .then((user) => {
        let cartItems = user.cart;
        cartCount = cartItems.items.length;
        res.render("user/checkout", {
          users: req.session.user,
          addresses: noneDeletedAddresses,
          cartItems,
          admin: false,
          user: true,
          showCategory,
          page: "checkout"
        });
      });
  },

  // to genarate coupon:
  couponGenerate: async (req, res) => {
    let userId = req.session.user._id;
    let user = await User.findById(userId);
    let totalPrice = parseInt(user.cart.totalPrice);
    let response = {};

    let coupon = await Coupon.findOne({ name: req.body.couponCode }, (err, doc) => {
      if (err) {
        console.log("finding error! ", err);
      } else {
        if (doc) {
          if (Date.now() >= doc.expiry) {
            response.expiry = true;
            console.log("coupon expired.. ", doc.expiry);
          } else {
            let isUsed = doc.usedUsers.findIndex((el) => {
              return new String(el.userId).trim() == new String(userId).trim();
            });
            if (isUsed >= 0) {
              response.used = true;
            } else {
              response.used = false;

              if (doc == null || doc == undefined) {
                console.log("failed coupon not found..", doc);
              } else {
                if (totalPrice >= doc.minCartAmount) {
                  totalPrice = totalPrice - doc.discount;
                  response.status = true;
                  response.total = totalPrice;
                  response.discount = doc.discount;
                } else {
                  response.status = false;
                  response.total = totalPrice;
                  response.min = doc.minCartAmount;
                }
              }
              response.total = totalPrice;
              response.discount = doc.discount;
            }
          }
        } else {
          response.error = true;
          response.total = totalPrice;
        }
      }
      res.json(response);
    });
  },

  // to place a order:
  placeOrder: async (req, res) => {
    try {
      console.log("body ==> ", req.body);
      let newTotal = req.body.total;
      let couponCode = req.body.couponCode;
      console.log("user id: ", req.session.user._id);
      let id = {
        userId: req.session.user._id
      };
      console.log("id: ", id);
      if (couponCode) {
        let coupon = await Coupon.findOne({ name: req.body.couponCode });
        let couponId = coupon._id;
        console.log("coupon code: ", couponCode);
        Coupon.findOneAndUpdate(
          { _id: couponId },
          { $push: { usedUsers: id }, $set: { updated: Date.now() } },
          { returnNewDocument: true },
          (err, data) => {
            if (err) {
              console.log("user data cant save into coupon database!! ", err);
            } else {
              console.log("userdata save in coupon databas successfully.. ", data);
            }
          }
        );
        console.log("after all operations-coupon: ", coupon);
      }
      let addressId = objId(req.body.data.address);
      console.log("add id  " + addressId);
      let paymentMethod = req.body.data.paymentMethod;
      let userId = req.session.user._id;
      let user = await User.findById(userId);
      let response = {};
      let newOrder = new Orders({
        user: userId,
        address: objId(addressId),
        cart: user.cart.items,
        nonDiscountedAmount: user.cart.totalPrice,
        paymentMethod: paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        date: Date.now(),
        total: newTotal
      });
      newOrder.save((err, doc) => {
        if (err) {
          console.log("order saving error!  ", err);
        } else {
          console.log("order saving success");
          User.updateOne(
            { _id: userId },
            { $set: { cart: { items: [] }, totalPrice: 0 } },
            (err, data) => {
              if (err) {
                console.log("removing failed! ", err);
              } else {
                console.log("removing cart items is succussful...");
              }
            }
          );
          if (req.body.data.paymentMethod == "COD") {
            response.codSuccess = true;
            console.log("cod success...");
            Orders.updateOne(
              { _id: doc._id },
              {
                $set: {
                  orderStatus: "placed"
                }
              },
              function (err, doc) {
                if (err) {
                  console.log("COD Order status updation failed! ");
                  console.log(err);
                } else {
                  console.log("COD order status updation succussful... ", doc);
                }
              }
            );
            res.json(response);
          } else {
            var options = {
              amount: newTotal * 100, // amount in the smallest currency unit
              currency: "USD",
              receipt: "" + doc._id
            };
            instance.orders.create(options, function (err, order) {
              if (err) {
                console.log("razorpay order error! ", err);
              } else {
                console.log("This is the order: ", order);
                response.razoorpay = true;
                response.order = order;
                res.json(response);
              }
            });
          }
        }
      });
      console.log("new order placed :  ", newOrder);
    } catch (e) {
      console.log("order ERROR!  ", e);
    }
  },

  // to verify payment:
  verifyPayment: async (req, res) => {
    try {
      console.log("payment data: ", req.body);
      let details = req.body.payment;
      let order = req.body.order;
      // let orders = await Orders.find()
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", process.env.SECRET_KEY);
      hmac.update(details.razorpay_order_id + "|" + details.razorpay_payment_id);
      hmac = hmac.digest("hex");
      if (hmac == details.razorpay_signature) {
        Orders.updateOne(
          { _id: order.receipt },
          {
            $set: {
              paymentStatus: "placed"
            }
          },
          function (err, doc) {
            if (err) {
              console.log("payment method updation failed! ");
              console.log(err);
            } else {
              console.log("payment method updation succussful... ", doc);
              res.json({ status: true });
            }
          }
        );
      } else {
        console.log("payment failed!!!!!!!");
        res.json({ status: false });
      }
    } catch (err) {
      console.log("payment verification area ERROR!!! ", err);
    }
  },

  // to cancel a order for user:
  cancelOrder: async (req, res) => {
    console.log(req.body);
    let id = req.body.orderId;
    Orders.findOneAndUpdate(
      { _id: id },
      { $set: { orderStatus: "Cancelled" } },
      { new: true },
      (err, doc) => {
        if (err) {
          console.log("order cancellation failed! ", err);
          res.json({ status: false });
        } else {
          console.log("order cancellation successful.. ", doc);
          res.json({ status: doc.orderStatus });
        }
      }
    );
  }

  // to set as defualt address
  /* setAsDefualtAddress: (req, res) => {
    let addressId = req.body.addressId;
    let user = req.session.user;
    User.updateOne(
      { _id: req.session.user._id, "addresses._id": addressId },
      { $set: { "addresses.$.defualt": true } }
    )
      .then((data) => {
        console.log(data);
        console.log("address set as defualt");
        res.json({others:false})
      })
      .catch((e) => {
        console.log(e);
        console.log("address defulat failed!");
      });
    */
  /* User.updateMany(
       { _id: req.session.user._id },
       { $set: { "addresses.$[defualt]": false } },
       {
         arrayFilters: [
           {
             "addresses._id": { $ne: addressId }
           }
         ],
         multi: true
       }
     )
       .then((data) => {
         console.log(data);
         console.log("addresses set to non defulat");
         res.json({ others: false });
       })
       .catch((e) => {
         console.log("addresses non defulat failed! " + e);
       }); 
  }*/
};
