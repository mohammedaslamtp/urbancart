if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");

/* const nocache = require("nocache"); */

//cache clearing...
app.use(function (req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
/* app.use(nocache()); */

/* mongoose connection */
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
const db = mongoose.connection;
db.on("error", () => console.error("error"));
db.once("open", () => console.log("Connected to Mongoose"));

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 10000000 }
  })
);

app.use("/", userRouter);
app.use("/admin", adminRouter);

// 404 error handling middleware:
app.use((req, res, next) => {
  res.status(404).render("user/404",{user:false,admin:false});
});

//Handle 500
app.use((req, res, next) => {
  res.status(500).render("user/500", { user: false, admin: false });
});



app.listen(process.env.PORT || 3000);
