const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require("jsonwebtoken");

const createUser = asyncHandler(async (req, res) => {
      const email = req.body.email;
      const findUser = await User.findOne({ email: email });
      if (!findUser) {
            //Create User
            const newUser = await User.create(req.body);
            // Nếu không dùng await thì sẽ không trả về kết quả trong res,bên postman cũng không nhận được kết quả
            res.json(newUser);
      } else {
            throw new Error('user already exists')
      }
})

const loginUserCtrl = asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      //check if user exist or not
      const findUser = await User.findOne({ email });
      if (findUser && await findUser.isPasswordMatched(password)) {
            const refreshToken = await generateRefreshToken(findUser?.id);
            const updateuser = await User.findByIdAndUpdate(findUser?.id,{
                  refreshToken: refreshToken
            }, {new: true});
            res.cookie("refreshToken", refreshToken, {
                  httpOnly: true,
                  maxAge: 72*60*60*1000, //Sau 72 giờ = 3 days, cookie sẽ tự động bị xóa khỏi trình duyệt của người dùng.
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
//logout
const logout = asyncHandler(async (req, res)=>{
      const cookie = req.cookies;
      if(!cookie?.refreshToken) throw new Error("No Refresh Token In Cookies");
      const refreshToken = cookie.refreshToken;
      const user = await User.findOne({ refreshToken });
      if(!user) {
            res.clearCookie("refreshToken", {
                  httpOnly: true,
                  secure: true
            });
            return res.sendStatus(204);
      }
      //
      await User.findOneAndUpdate({refreshToken}, {
            refreshToken: '',
      })
      res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
      });
      res.sendStatus(204);

})


//Handle refresh token
//Todo 2.05h 
const handleRefreshToken = asyncHandler(async(req, res)=>{
      const cookie = req.cookies;
      if(!cookie?.refreshToken) throw new Error("No Refresh Token In Cookies");
      const refreshToken = cookie.refreshToken;
      const user = await User.findOne({refreshToken});
      if(!user) throw new Error("No Refresh Token In Database");
      jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if(err || user.id !== decoded.id) throw new Error("There are something wrong with token");
            //Mongoose cung cấp một thuộc tính id là alias (biệt danh) cho _id. 
            // nen la dung id va _id deu duoc
            const accessToken = generateRefreshToken(user?._id);
            res.json({accessToken});
      })
})


//Update a user
const updatedUser = asyncHandler(async (req, res) => {
      const { id } = req.user;
      // const { _id } = req.user;
      validateMongoDbId(id);
      console.log("🚀 ~ updatedUser ~ req.user:", req.user)
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
      const {id} = req.params;
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
      const {id} = req.params;
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



module.exports = {
      createUser,
      loginUserCtrl, getallUser,
      getaUser, deleteaUser,
      updatedUser,
      blockUser, unblockUser,
      handleRefreshToken,
      logout
}