// Xac thuc Mongodb ID
// Sau buoc block user va un block user
//Kiem tra xe nguoi dung truyen len co phai la Id hop le hay khong
const mongoose = require("mongoose");
const validateMongoDbId = (id) =>{
    const isValid = mongoose.Types.ObjectId.isValid(id);
    console.log("🚀 ~ validateMongoDbId ~ isValid:", isValid)
    if(!isValid) throw new Error("This id is not valid or not found");
}

module.exports = {
    validateMongoDbId
}