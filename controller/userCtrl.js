const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require('../utils/validateMongodbId');

const createUser = asyncHandler(async (req, res) => {
      const email = req.body.email;
      const findUser = await User.findOne({ email: email });
      if (!findUser) {
            //Create User
            const newUser = await User.create(req.body);
            // Nếu không dùng await thì sẽ không trả về kết quả trong res,bên postman cũng không nhận được kết quả
            res.json(newUser);
      } else {
            throw new Error('ser already exists')
      }
})

const loginUserCtrl = asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      //check if user exist or not
      const findUser = await User.findOne({ email });
      if (findUser && await findUser.isPasswordMatched(password)) {
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
      blockUser, unblockUser
}