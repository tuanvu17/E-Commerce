//access Database
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

const createProduct = asyncHandler(async (req, res)=>{
    try {
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
    res.json({
        message:"Hey, its product post rouuter"
    })
})

const getaProduct  = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    console.log("🚀 ~ getaProduct ~ id:", id)
    try {
        const findProduct = await Product.findById(id);
        console.log("🚀 ~ getaProduct ~ findProduct:", findProduct)
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
        
    }
})

const getAllProduct = asyncHandler(async(req, res) =>{
    try {
        const getallProducts = await Product.find();
        res.json(getallProducts);
    } catch (error) {
        throw new Error(error);
        
    }
})
module.exports = {
    createProduct,
    getaProduct,
    getAllProduct
}