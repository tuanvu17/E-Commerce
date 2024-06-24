const { generateToken } = require('../config/jwtToken');
var uniqid = require('uniqid');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel'); // cu goi den schema nay la no se hien trong mongoosedb
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require("jsonwebtoken");
const { json } = require('body-parser');
const { sendEmail } = require('./emailCtrl');
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res) => {

      // get the email from req.body
      const email = req.body.email;

      // with the help of email find the user exists or not 
      const findUser = await User.findOne({ email: email });
      if (!findUser) {
            //if user not found Create a new User
            const newUser = await User.create(req.body);
            // Nếu không dùng await thì sẽ không trả về kết quả trong res,bên postman cũng không nhận được kết quả
            res.json(newUser);
      } else {
            throw new Error('user already exists');
      }
})

const loginUserCtrl = asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      //check if user exist or not
      const findUser = await User.findOne({ email });

      if (findUser && await findUser.isPasswordMatched(password)) {
            const refreshToken = await generateRefreshToken(findUser?.id);
            const updateuser = await User.findByIdAndUpdate(findUser?.id, {
                  refreshToken: refreshToken
            }, { new: true });
            res.cookie("refreshToken", refreshToken, {
                  httpOnly: true,
                  maxAge: 72 * 60 * 60 * 1000, //Sau 72 giờ = 3 days, cookie sẽ tự động bị xóa khỏi trình duyệt của người dùng.
            })
            res.json({
                  _id: findUser?._id,
                  firstname: findUser?.firstname,
                  lastname: findUser?.lastname,
                  email: findUser?.email,
                  mobile: findUser?.mobile,
                  token: generateToken(findUser?._id)
            })

      } else {
            throw new Error("Invalid Cerdentials ");
      }
})

//login Admin

const loginAdmin = asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      //check if user exist or not
      const findAdmin = await User.findOne({ email });
      if (findAdmin.role !== 'admin') throw new Error("Not Authorised");
      if (findAdmin && await findAdmin.isPasswordMatched(password)) {
            const refreshToken = await generateRefreshToken(findAdmin?.id);
            const updateuser = await User.findByIdAndUpdate(findAdmin?.id, {
                  refreshToken: refreshToken
            }, { new: true });

            res.cookie("refreshToken", refreshToken, {
                  httpOnly: true,
                  maxAge: 72 * 60 * 60 * 1000, //Sau 72 giờ = 3 days, cookie sẽ tự động bị xóa khỏi trình duyệt của người dùng.
            })
            res.json({
                  _id: findAdmin?._id,
                  firstname: findAdmin?.firstname,
                  lastname: findAdmin?.lastname,
                  email: findAdmin?.email,
                  mobile: findAdmin?.mobile,
                  token: generateToken(findAdmin?._id)
            })

      } else {
            throw new Error("Invalid Cerdentials ");
      }
})

//logout
const logout = asyncHandler(async (req, res) => {
      const cookie = req.cookies;
      if (!cookie?.refreshToken) throw new Error("No Refresh Token In Cookies");
      const refreshToken = cookie.refreshToken;
      const user = await User.findOne({ refreshToken });
      if (!user) {
            res.clearCookie("refreshToken", {
                  httpOnly: true,
                  secure: true
            });
            return res.sendStatus(204);
      }           
      //
      await User.findOneAndUpdate({ refreshToken }, {
            refreshToken: '',
      })
      res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
      });
      res.sendStatus(204);

})

// Chủ yếu dùng trong Trình duyệt, không cần phải đăng nhập lại
// Còn hệ thống Winform thường phải login, logout thường xuyên, nên không cần phải lưu trữ Token

// Người dùng đăng nhập thành công, hệ thống tạo accessToken và refreshToken.
// accessTokenp được gửi cho người dùng để truy cập các tài nguyên trong hệ thống.
// refreshToken được đặt trong Cokkie trình duyệt người dùng
// refreshToken được lưu trữ an toàn trên máy chủ.
// Khi accessToken  hết hạn, người dùng gửi refreshToken đến máy chủ.
// Máy chủ xác minh refreshToken, nếu có trên máy chủ người dùng và tạo accessToken cho người dùng.

//Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
      const cookie = req.cookies;
      if (!cookie?.refreshToken) throw new Error("No Refresh Token In Cookies");
      const refreshToken = cookie.refreshToken;
      const user = await User.findOne({ refreshToken });
      if (!user) throw new Error("No Refresh Token In Database");
      jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err || user.id !== decoded.id) throw new Error("There are something wrong with token");
            //Mongoose cung cấp một thuộc tính id là alias (biệt danh) cho _id. 
            // nen la dung id va _id deu duoc
            const accessToken = generateRefreshToken(user?._id);
            res.json({ accessToken });
      })
})


//Update a user
const updatedUser = asyncHandler(async (req, res) => {
      const { id } = req.user;
      // const { _id } = req.user;
      validateMongoDbId(id);
      try {
            const updatedUsers = await User.findByIdAndUpdate(
                  id,
                  {
                        firstname: req?.body?.firstname,
                        lastname: req?.body?.lastname,
                        email: req?.body?.email,
                        mobile: req?.body?.mobile,
                  }, {
                  new: true,
            });
            res.json(updatedUsers);
      } catch (error) {
            throw new Error(error);
      }
})

// save Address

const saveAddress = asyncHandler(async (req, res) => {
      const { _id } = req.user;
      validateMongoDbId(_id);

      try {
            const updatedUsers = await User.findByIdAndUpdate(
                  _id,
                  {
                        address: req?.body?.address,
                  }, {
                  new: true,
            });
            res.json(updatedUsers);
      } catch (error) {
            throw new Error(error);
      }
})


// get all user
const getallUser = asyncHandler(async (req, res) => {
      try {
            const getUsers = await User.find();
            res.json(getUsers);
      } catch (error) {
            throw new Error(error)
      }
})

// get a single user
const getaUser = asyncHandler(async (req, res) => {
      const { id } = req.params;
      validateMongoDbId(id);
      try {
            const getaUser = await User.findById(id);
            res.json({
                  getaUser,
            })
      } catch (error) {
            throw new Error(error)
      }

})


// delete a single user
const deleteaUser = asyncHandler(async (req, res) => {
      const { id } = req.params;
      validateMongoDbId(id);

      try {
            const deleteaUser = await User.findByIdAndDelete(id);
            res.json({
                  deleteaUser,
            })
      } catch (error) {
            throw new Error(error)
      }

})

const blockUser = asyncHandler(async (req, res) => {
      const { id } = req.params;
      validateMongoDbId(id);

      try {
            const block = await User.findByIdAndUpdate(
                  id, {
                  isBlocked: true
            },
                  {
                        new: true // tra ve user updated
                  }
            );
            res.json({
                  message: "User Block"
            })
      } catch (error) {
            throw new Error(error)
      }
})

const unblockUser = asyncHandler(async (req, res) => {
      const { id } = req.params;
      validateMongoDbId(id);

      try {
            const unblock = await User.findByIdAndUpdate(id, {
                  isBlocked: false
            },
                  {
                        new: true // tra ve user updated
                  }
            );
            res.json({
                  message: "User UnBlock"
            })
      } catch (error) {
            throw new Error(error)
      }
})

const updatePassword = asyncHandler(async (req, res) => {
      const { _id } = req.user;
      const { password } = req.body;
      validateMongoDbId(_id);
      const user = await User.findById(_id);
      if (password) {
            user.password = password;
            const updatePassword = await user.save();
            res.json(updatePassword);
      } else {
            res.json(user);
      }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) throw new Error("User not found with this email");
      try {
            const token = await user.createPasswordResetToken();
            await user.save();
            const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
            const data = {
                  to: email,
                  text: "Hey User",
                  subject: "Forgot Password Link",
                  htm: resetURL,
            };
            await sendEmail(data);
            res.json(token);
      } catch (error) {
            throw new Error(error);
      }
});


const resetPassword = asyncHandler(async (req, res) => {
      const { password } = req.body;
      const { token } = req.params;
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const update = {
            passwordResetToken: hashedToken,
            passwordResetExpries: { $gt: new Date(Date.now()) },
      }
      const user = await User.findOne(update);

      if (!user) throw new Error(" Token Expired, Please try again later");
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.json(user);
});


const getWishlist = asyncHandler(async (req, res) => {

      const { _id } = req.user;

      try {
            const findUser = await User.findById(_id).populate("wishlist");
            // sử dụng populate("wishlist");  để hạn chế câu lênh truy vấn
            // truy vấn theo Id của product, sau đó ghi đè vào trường wishlist thông tin detail product, trả về cho người dùng 
            console.log("🚀 ~ getWishlist ~ findUser:", findUser)
            res.json(findUser);
      } catch (error) {
            throw new Error(error);
      }
})

const userCart = asyncHandler(async (req, res) => {
      const { cart } = req.body;
      const { _id } = req.user;
      validateMongoDbId(_id);
      try {
            let products = [];
            const user = await User.findById(_id);
            // check if user already have product in cart?
            const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
            if (alreadyExistCart) {
                  alreadyExistCart.remove();
            }
            for (let i = 0; i < cart.length; i++) {
                  let object = {};
                  object.product = cart[i]._id;
                  object.count = cart[i].count;
                  object.color = cart[i].color;
                  let getPrice = await Product.findById(cart[i]._id).select("price").exec();
                  console.log("🚀 ~ userCart ~ getPrice:", getPrice)
                  object.price = getPrice.price;
                  products.push(object);
            }
            let cartTotal = 0;
            for (let i = 0; i < products.length; i++) {
                  cartTotal = cartTotal + products[i].price * products[i].count
            }
            console.log("🚀 ~ userCart ~ cartTotal:", cartTotal)
            let newCart = await new Cart({
                  products,
                  cartTotal,
                  orderBy: user?._id
            }).save();
            res.json(newCart)

      } catch (error) {
            throw new Error(error);
      }

})

const getUserCart = asyncHandler(async (req, res) => {
      const { _id } = req.user;

      try {
            const cart = await Cart.findOne({ orderBy: _id }).populate(
                  "products.product"); // lay chi tiet cac truongf thuoc product, xem Postman de thay ket qua chi tiet
            //"products.product", "title ");  // chi lay truongf title cho vao trong result 
            res.json(cart)
      } catch (error) {
            throw new Error(error);
      }
})

const emptyCart = asyncHandler(async (req, res) => {
      const { _id } = req.user;

      try {
            const user = await User.findOne({ _id });
            const cart = await Cart.findOneAndDelete({ orderBy: user._id });

            res.json(cart)
      } catch (error) {
            throw new Error(error);
      }
})

const applyCoupon = asyncHandler(async (req, res) => {
      const { _id } = req.user;
      const { coupon } = req.body;
      validateMongoDbId(_id);
      const validCoupon = await Coupon.findOne({ name: coupon });

      if (validCoupon === null) {
            throw new Error("Invalid Coupon");
      }
      try {
            const user = await User.findOne({ _id });
            const { products, cartTotal } = await Cart.findOne({ orderBy: user._id })
                  .populate("products.product");

            let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
            await Cart.findOneAndUpdate(
                  { orderBy: user._id },
                  { totalAfterDiscount },
                  { new: true }
            )
            res.json(totalAfterDiscount)
      } catch (error) {
            throw new Error(error);
      }
})

const createOrder = asyncHandler(async (req, res) => {
      const { COD, couponApplied } = req.body;
      const { _id } = req.user;
      validateMongoDbId(_id);

      try {
            if (!COD) throw new Error("Create cash order failed");
            const user = await User.findById(_id);
            let userCart = await Cart.findOne({ orderBy: user._id });

            let finalAmout = 0;
            if (couponApplied && userCart.totalAfterDiscount) {
                  finalAmout = userCart.totalAfterDiscount * 100;
            } else {
                  finalAmout = userCart.cartTotal * 100;
            }

            let newOrder = await new Order({
                  products: userCart.products,
                  paymentIntent: {
                        id: uniqid(),
                        method: "COD",
                        amount: finalAmout,
                        status: "Cash on Delivery",
                        created: Date.now(),
                        currency: "usd"
                  },
                  orderBy: user._id,
                  orderStatus: "Cash on Delivery",
            }).save()
            let update = userCart.products.map((item) => {
                  return {
                        updateOne: {
                              filter: { _id: item.product._id },
                              update: { $inc: { quantity: -item.count, sold: +item.count } },

                        }
                  }
            })
            const updated = await Product.bulkWrite(update, {});
            res.json({ message: "success" });

      } catch (error) {
            throw new Error(error);
      }
})

const getOrders = asyncHandler(async (req, res) => {
      const { _id } = req.user;
      validateMongoDbId(_id);

      try {
            const userOrders = await Order.findOne({ orderBy: _id }).populate("products.product").exec();
            res.json(userOrders);

            res.json(cart)
      } catch (error) {
            throw new Error(error);
      }
})

const updateOrderStatus = asyncHandler(async (req, res) => {
      const { status } = req.body;
      const { id } = req.params;
      validateMongoDbId(id);
      try {
            const updateOrderStatus = await Order.findByIdAndUpdate(id,
                  {
                        orderStatus: status,
                        paymentIntent: {
                              status: status
                        }
                  },
                  {
                        new: true
                  }
            );
            console.log("🚀 ~ updateOrderStatus ~ updateOrderStatus:", updateOrderStatus)
            res.json(updateOrderStatus);
      } catch (error) {
            throw new Error(error);
      }
})

module.exports = {
      createUser,
      loginUserCtrl, 
      getallUser,
      getaUser, 
      deleteaUser,
      updatedUser,
      blockUser, unblockUser,
      handleRefreshToken,
      logout,
      updatePassword,
      forgotPasswordToken,
      resetPassword,
      loginAdmin,
      getWishlist,
      saveAddress,
      userCart,
      getUserCart,
      emptyCart,
      applyCoupon,
      createOrder,
      getOrders,
      updateOrderStatus
}

//Todo : 7.30 +- 2