//check xem lieu admin hay user
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

//Kiem tra xem Token ng gui len co trong Database server hay khong
const authMiddleware = asyncHandler(async(req, res, next) =>{
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]; // chuyen thanh mang, lay phan tu thu 2
        try {
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user = user; // lay user trong database khi check Token, luu vao bien req.user
                next();
            }
        } catch (error) {
            throw new Error('NOT Authorization token expired, Please Login again')
        }
    }else{
        throw new Error('There is no token attached to header')
    }
})

const isAdmin = asyncHandler(async(req, res, next) =>{
    const {email} = req.user;
    const adminUser = await User.findOne({email});
    if(adminUser.role !== 'admin'){
        throw new Error('You are not an admin') 
    }else{
        next();// cho phep chạy các middleware tiếp theo
    }
})


module.exports = {authMiddleware, isAdmin}