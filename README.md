# E-Commerce
// npm run server
//upload image
//https://console.cloudinary.com/pm/c-ca8dd36915758d118f8c0521f8cabe/media-explorer/CloudinaryDemo
// Node có ảnh chứa cách sử dụng form-data 



// Giải thích các thư viện trong Node.js:
// 1. multer:
// Thư viện multer là một middleware phổ biến trong Node.js được sử dụng để xử lý các request đa phần tử (multipart/form-data).
// Multipart/form-data thường được sử dụng để upload file lên server.
// multer cung cấp các phương thức để xác thực loại file, đặt tên file, lưu trữ file tại một vị trí cụ thể trên server, và giới hạn kích thước file upload.
// 2. sharp:

// Thư viện sharp là một thư viện xử lý hình ảnh mạnh mẽ cho Node.js.
// Nó cho phép bạn thực hiện nhiều tác vụ trên hình ảnh như resize, crop, convert format, apply filters, ...
// sharp có ưu điểm là xử lý hình ảnh nhanh chóng và tiết kiệm bộ nhớ.
// 3. path:

// Thư viện path là một module tích hợp sẵn trong Node.js cung cấp các phương thức để thao tác với đường dẫn (path) của file system.
// Ví dụ, bạn có thể sử dụng path để lấy tên file, extension, đường dẫn thư mục cha, ...
// Thư viện này giúp bạn thao tác với các đường dẫn file một cách dễ dàng và an toàn.
// 4. fs (file system):

// fs là một module tích hợp sẵn trong Node.js cung cấp các phương thức để tương tác với hệ thống file.
// Bạn có thể sử dụng fs để đọc file, ghi file, tạo thư mục, xóa file, ...
// Lưu ý rằng sử dụng fs cần cẩn thận để tránh các lỗi liên quan đến quyền truy cập file.
// Tổng hợp:

// Bốn thư viện multer, sharp, path, và fs thường được sử dụng kết hợp với nhau để xử lý upload và thao tác hình ảnh trên server Node.js.

// multer giúp bạn upload file lên server.
// sharp giúp bạn resize, crop, convert format, ... hình ảnh đã upload.
// path giúp bạn thao tác với đường dẫn của file hình ảnh.
// fs giúp bạn lưu trữ hình ảnh đã qua xử lý trên server.

//my cloudinary
//https://console.cloudinary.com/pm/c-ca8dd36915758d118f8c0521f8cabe/media-explorer/CloudinaryDemo