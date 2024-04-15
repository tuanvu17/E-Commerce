const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto")
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
      firstname: {
            type: String,
            required: true,
      },
      lastname: {
            type: String,
            required: true,
      },
      email: {
            type: String,
            required: true,
            unique: true,
      },
      mobile: {
            type: String,
            required: true,
            unique: true,
      },
      password: {
            type: String,
            required: true,
      },
      role: {
            type: String,
            default: "user"
      },
      isBlocked: {
            type: Boolean,
            default: false
      },
      cart: {
            type: Array,
            default: []
      },
      address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }], // 1 mamg cac Id refer den Address
      wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      refreshToken: {
            type: String,
      },
      passwordChangeAt: Date,
      passwordResetToken: String,
      passwordResetExpries: Date
}, {
      timestamps: true
}
);

// sử dụng thư viện bcrypt để mã hóa mật khẩu người dùng trước khi lưu trữ trong database
//Tạo một chuỗi ký tự ngẫu nhiên (salt) với độ dài 10 ký tự bằng phương thức genSaltSync của thư viện bcrypt
//Gọi hàm callback next để thông báo rằng việc xử lý trước khi lưu trữ đã hoàn thành và cho phép lưu trữ đối tượng người dùng tiếp tục
userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) {
            next();
      }
      const salt = bcrypt.genSaltSync(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
})

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
}
// Todo 3:42 =>> Gemini? cach hoat dong cua userSchema.pre
userSchema.methods.createPasswordResetToken = async function () {
      const resetToken = crypto.randomBytes(32).toString("hex"); //Tao moi chuoi dang Hex 32 bytes -> de dang truyen tai
      this.passwordResetToken = crypto
            .createHash("sha256") // Tạo một đối tượng hash sử dụng thuật toán SHA-256.
            .update(resetToken) // Cập nhật dữ liệu cần hash với chuỗi token ngẫu nhiên đã tạo ở bước 1.
            .digest("hex"); //Tạo ra bản tóm tắt hash của token dưới dạng chuỗi hexa.
      
      this.passwordResetExpries = Date.now() + 30 * 60 * 1000; //2024-04-12T14:06:19.433Z
      
      console.log("🚀 ~ this.passwordResetExpries:", this.passwordResetExpries)
      return resetToken;
}
//Export the model
module.exports = mongoose.model('User', userSchema);