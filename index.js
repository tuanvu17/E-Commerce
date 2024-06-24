// TODO: 1.30 =>> XEM LAIJ 
const express = require('express');
const dbConnect = require('./config/bdConnect');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const categoryRouter = require('./routes/prodcategoryRoute');
const blogcategoryRouter = require('./routes/blogCatRoute');
const brandRouter = require('./routes/brandRoute');
const colorRouter = require('./routes/colorRoute');
const couponRouter = require("./routes/couponRoute");

const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const morgan = require("morgan");


dbConnect();

app.use(morgan("dev")); // main tain API 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); //Middleware này trích xuất dữ liệu từ body của request và chuyển đổi nó thành một object JavaScript
app.use(cookieParser());
app.use('/api/user', authRouter);

app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/category', categoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);

//Khi chay request postman, muon gui ve Error cho client, t se gui the cau hinh sau:
app.use(notFound);
app.use(errorHandler);


app.listen(PORT, ()=>{
      console.log(`🚀 Server is running at PORT ${PORT}`);
})

//Todo: 6:45