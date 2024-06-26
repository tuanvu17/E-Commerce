//access Database
const { isValidObjectId } = require("mongoose");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const {cloudinaryUploadImg} = require("../utils/cloudinary")
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
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const filter = { _id: id };
        const update = req.body;

        const updateProduct = await Product.findOneAndUpdate(filter, update, { new: true });

        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {

        const deleteProduct = await Product.findOneAndDelete(id)

        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
});
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);

    }
})

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        //Filltering
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        //Sorting
        //localhost:5000/api/product/?price[gte]=3000; gte >= 3000
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(" ");
            //name,-age.split(',') -> ['name', '-age'].
            //['name', '-age'].join(' ') -> 'name -age'
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createAt");
        }

        //Limiting the fields : Gioi han truong du lieu
        // localhost:5000/api/product/?fields=title,price,category
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select('-__v'); // dau - la khong tinh truong v trong ket qua tra ve
        }

        //pagination
        const page = req.query.page; // chua so trang hien tai, trang 1, trang 2, trang 3 ,...
        const limit = req.query.limit; //so luong tai lieu moi trang
        const skip = (page - 1) * limit; // tinh so luong tai lieu can bo qua
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            console.log("🚀 ~ getAllProduct ~ skip:", skip)
            console.log("🚀 ~ getAllProduct ~ productCount:", productCount)
            if (skip >= productCount) throw new Error("This Pages dose not exits");
        }
        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
})

const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        console.log("🚀 ~ addToWishlist ~ user:", user)
        const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
        if (alreadyadded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        }
    } catch (error) {
        throw new Error(error);
    }
});

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        //kiểm tra xem người dùng đã đánh giá sản phẩm này chưa.
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
                },
                {
                    new: true,
                }
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedby: _id,
                        },
                    },
                },
                {
                    new: true,
                }
            );
        }
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalproduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating: actualRating,
            },
            { new: true }
        );
        res.json(finalproduct);
    } catch (error) {
        throw new Error(error);
    }
});
// upload on clound, get link and Put into itself
const uploadImages =  asyncHandler(async (req, res) => {
    const {id} = req.params;
    isValidObjectId(id);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for(const file of files ) {
            const {path} = file;
            const newpath = await uploader(path);
            urls.push(newpath);
        }
        const findProduct  = await Product.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) =>{
                    return file;
                }),
            },
            {
                new: true
            }
        )
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
        
    }
})

module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages
}