
const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully" )
  } catch (error) {
    console.log("Database error", error);
  }
};
module.exports = dbConnect;