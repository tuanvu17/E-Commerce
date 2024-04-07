const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require("bcrypt");
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
      role:{
            type:String,
            default: "user"
      },
      isBlocked:{
            type: Boolean,
            default: false
      },
      cart: {
            type: Array,
            default:[]
      },
      address: [{type: mongoose.Schema.Types.ObjectId, ref: "Address"}],
      wishlist: [{type:  mongoose.Schema.Types.ObjectId, ref: "Product"}],
      refreshToken:{
            type: String,
            
      }
},{
      timestamps: true
}
);

// sử dụng thư viện bcrypt để mã hóa mật khẩu người dùng trước khi lưu trữ trong database
//Tạo một chuỗi ký tự ngẫu nhiên (salt) với độ dài 10 ký tự bằng phương thức genSaltSync của thư viện bcrypt
//Gọi hàm callback next để thông báo rằng việc xử lý trước khi lưu trữ đã hoàn thành và cho phép lưu trữ đối tượng người dùng tiếp tục
userSchema.pre("save", async function(next){
      const salt = bcrypt.genSaltSync(10);
      this.password = await bcrypt.hash(this.password, salt);
})    

userSchema.methods.isPasswordMatched = async function(enteredPassword){
      return await bcrypt.compare(enteredPassword, this.password);
}
//Export the model
module.exports = mongoose.model('User', userSchema);