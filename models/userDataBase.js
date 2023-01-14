const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    phone: {
      type: Number,
      required: true
    },
    nPassword: {
      type: String,
      required: true
    },
    cPassword: {
      type: String,
      required: true
    },
    access: {
      type: Boolean,
      default: true
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Types.ObjectId,
            ref: "product",
            required: true
          },
          qty: {
            type: Number,
            required: true
          }
        }
      ],
      totalPrice: Number
    },
    wishlist: {
      items: [
        {
          productId: {
            type: mongoose.Types.ObjectId,
            ref: "product"
            /*  required: true */
          }
        }
      ]
    },
    addresses: [
      {
        fullName: {
          type: String,
          required: true
        },
        mobile: {
          type: Number,
          required: true
        },
        pincode: {
          type: Number,
          required: true
        },
        city: {
          type: String,
          required: true
        },
        district: {
          type: String,
          required: true
        },
        landMark: {
          type: String,
          required: true
        },
        state: {
          type: String,
          required: true
        },
        country: {
          type: String,
          required: true
        },
        defualt: {
          type: Boolean,
          default: false
        },
        isDeleted: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  { timestamps: true }
);

userSchema.methods.addItemToCart = function (product) {
  let cart = this.cart;
  const isExisting = cart.items.findIndex((objInItems) => {
    return new String(objInItems.productId).trim() == new String(product._id).trim();
  });
  if (isExisting >= 0) {
    cart.items[isExisting].qty += 1;
  } else {
    cart.items.push({ productId: product._id, qty: 1 });
  }
  if (!cart.totalPrice) {
    cart.totalPrice = 0;
  }
  cart.totalPrice += product.price;
  return this.save();
};

userSchema.methods.changeQuantity = function (item, count, userId, cb) {
  let cart = this.cart;
  let response = {};
  const isExisting = cart.items.findIndex((objInItems) => {
    return new String(objInItems.productId).trim() == new String(item._id).trim();
  });
  let quantity = cart.items[isExisting].qty;
  if ((count == -1 && quantity == 1) || count == -2) {
    cart.totalPrice -= quantity * item.price;
    cart.items.splice(isExisting, 1);
    response.qty = 0;
    response.remove = true;
  } else if (count == -1) {
    cart.totalPrice -= item.price;
    cart.items[isExisting].qty += count;
    response.qty = cart.items[isExisting].qty;
  } else if (count == 1) {
    cart.totalPrice += item.price;
    cart.items[isExisting].qty += count;
    response.qty = cart.items[isExisting].qty;
  }
  this.save().then((doc) => {
    response.totalPrice = cart.totalPrice;
    response.length = cart.items.length;
    cb(response);
  });
};

userSchema.methods.addToWishlist = function (itemId, cb) {
  let wishlist = this.wishlist;
  let response = {};
  const isExisting = wishlist.items.findIndex((objInItems) => {
    return new String(objInItems.productId).trim() == new String(itemId).trim();
  });
  if (isExisting >= 0) {
    wishlist.items[isExisting].productId = itemId;
  } else {
    wishlist.items.push({ productId: itemId });
  }
  this.save().then((doc) => {
    response.success = true;
    response.length = wishlist.items.length;
    cb(response);
  });
};

userSchema.methods.removeWishlistItem = function (itemId, cb) {
  console.log("item id: " + itemId);
  let wishlist = this.wishlist;
  let response = {};
  const isExisting = wishlist.items.findIndex((el) => {
    return new String(el.productId).trim() == new String(itemId).trim();
  });
  if (isExisting >= 0) {
    wishlist.items.splice(isExisting, 1);
    response.isDeleted = true;
  } else {
    response.isDeleted = false;
  }

  this.save().then((doc) => {
    response.length = wishlist.items.length;
    cb(response);
  });
};

module.exports = mongoose.model("customers", userSchema);
