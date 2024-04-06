//not Foud

const notFound = (req, res, next) =>{
      const error = new Error(`Not Found : ${req.originalUrl}`);
      res.status(404);
      next(error);
}
//Error Handler
const errorHandler = (err, req, res, next) =>{
      const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
      res.status(statuscode);
      res.json({
            message: err?.message,// Gán "err" cho message neeu err co gia tri; đơn giản hóa code.
            stack: err?.stack
      })
}

module.exports = {errorHandler, notFound};