//access Database
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");


const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
    res.json({
        message: "Hey, its product post rouuter"
    })
})

const updateProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const filter = { _id: id };
        const update = req.body;

        const updateProduct  = await Product.findOneAndUpdate(filter, update, { new: true });
        
        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {

        const deleteProduct  = await Product.findOneAndDelete(id)
        
        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
});
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log("🚀 ~ getaProduct ~ id:", id)
    try {
        const findProduct = await Product.findById(id);
        console.log("🚀 ~ getaProduct ~ findProduct:", findProduct)
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);

    }
})

const getAllProduct = asyncHandler(async (req, res) => {
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
    getAllProduct,
    updateProduct,
    deleteProduct
}