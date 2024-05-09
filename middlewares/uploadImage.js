const multer = require("multer"); //được sử dụng để upload file lên server
const sharp = require("sharp"); //xu ly trên hình ảnh như resize, crop, convert format,
const path = require("path");
const fs = require("fs");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images")); // vị trí lưu khi user gửi image lên
  },
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniquesuffix + ".jpg");
  },
});

//Chỉ cho phép upload các file là định dạng image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true); //callback
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
  storage: storage, // vị trí lưu trữ
  fileFilter: multerFilter, // lọc ảnh
  limits: { fileSize: 2000000 }, // vượt quá 2MB thì không cho lưu
});

const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(450, 300)
        .toFormat("png")      
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`); // sau khi sharp ảnh, lưu thành ảnh khác vào thư mục mới
      fs.unlinkSync(`public/images/${file.filename}`);  // xóa ảnh gốc vì không còn cần thiết. 
      //Sau khi resize ảnh thành kích thước nhỏ hơn, 
      //file ảnh gốc không còn cần thiết. 
      //Việc xóa file gốc giúp giải phóng dung lượng lưu trữ trên máy chủ.
    })
  );
  next();
};

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
      fs.unlinkSync(`public/images/blogs/${file.filename}`);
    })
  );
  next();
};
module.exports = { uploadPhoto, productImgResize, blogImgResize };



