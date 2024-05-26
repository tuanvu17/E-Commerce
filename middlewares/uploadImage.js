const multer = require("multer"); //được sử dụng để upload file lên server
const sharp = require("sharp"); //xu ly trên hình ảnh như resize, crop, convert format,
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) { //Chỉ định vị trí lưu ban đầutrên disk - local

    cb(null, path.join(__dirname, "../public/images")); // vị trí lưu khi user gửi image lên
  },
  filename: function (req, file, cb) { //Khởi tạo tên file ảnh
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg"); // jpg | png 
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

// Config Multer
const uploadPhoto = multer({
  storage: storage, // vị trí lưu trữ
  fileFilter: multerFilter, // lọc ảnh
  limits: { fileSize: 2000000 }, // vượt quá 2MB thì không cho lưu
});

const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all( // Tất cả đặt trong Promise để chạy cho xong 
    req.files.map(async (file) => {
      await sharp(file.path) // Sử dụng sharp để chỉnh sửa ảnh
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({
          quality: 100,
          chromaSubsampling: '4:4:4'
        })
        // sau khi sharp ảnh, copy và lưu thành ảnh khác vào thư mục mới
        .toFile(`public/images/products/${file.filename}`); 

        // xóa ảnh gốc vì không còn cần thiết. 
        fs.unlinkSync(`public/images/${file.filename}`);  

        //gan lai path trong req để path trỏ tới image mà mình vừa sharp ở trên
        file.path = `public/images/products/${file.filename}`
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
      fs.unlinkSync(`public/images/${file.filename}`);
      file.path = `public/images/blogs/${file.filename}`;
    })
  );
  next();
};

module.exports = { uploadPhoto, productImgResize, blogImgResize };

// Todo: 7.18


