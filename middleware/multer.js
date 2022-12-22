/* multer init */
const multer = require("multer");

/* multer destination */
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  }
});
const upload = multer({ storage: fileStorageEngine });

module.exports = upload;
