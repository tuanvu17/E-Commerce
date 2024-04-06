// TODO: 1.30 =>> XEM LAIJ 
const express = require('express');
const dbConnect = require('./config/bdConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
dbConnect()
app.use('/api/user', authRouter);

app.use(notFound);
app.use(errorHandler);


app.listen(PORT, ()=>{
      console.log(`🚀 Server is running at PORT ${PORT}`);
})