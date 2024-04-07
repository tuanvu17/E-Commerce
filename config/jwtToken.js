const jwt = require("jsonwebtoken");

const generateToken = (id) =>{
      return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
}

module.exports = {generateToken};

// process.env.JWT_SECRET: Đây là một biến môi trường chứa chuỗi ký tự bí mật (secret key) được sử dụng để mã hóa token. Lưu ý: Không nên lưu trữ trực tiếp secret key trong code mà nên sử dụng biến môi trường để đảm bảo tính bảo mật.
// { expiresIn: "3d" }: Đây là một object option (đối tượng tùy chọn) để cấu hình thời gian hiệu lực của token. Trong trường hợp này, expiresIn: "3d" thiết lập thời gian hiệu lực là 3 ngày ("3d").
