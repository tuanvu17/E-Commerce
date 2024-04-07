//!mdbgum 
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        require: true
    },
    brand: {
        type: String,
        require: true
    },
    quantity: {
        type: Number,
        require: true
    },
    sold:{
        type: Number,
        default: 0
    },
    images: {
        type: Array,
    },
    color: {
        type: String,
        require: true
    },
    ratings: [{
        star: Number,
        postedby: { type: mongoose.Types.ObjectId, ref: "User" }
    }]
}, {timestamps: true});
//timestamps: true cho phép Mongoose tự động thêm timestamp vào document.
//Timestamp bao gồm createdAt và updatedAt.
//Export the model
module.exports = mongoose.model('Product', productSchema);