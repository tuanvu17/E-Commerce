const express = require("express");
const {
    createUser, 
    loginUserCtrl, 
    getallUser, 
    getaUser, 
    deleteaUser, 
    updatedUser, 
    blockUser, 
    unblockUser, 
    handleRefreshToken, 
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.put("/password", authMiddleware, updatePassword);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);

router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdmin);
router.post("/cart",authMiddleware,  userCart);
router.post("/cart/applyllUser");
router.get("/get-orders",authMiddleware, getOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
// router.get("/logout", logout, authMiddleware, applyCoupon);
router.post("/cart/cash-order",authMiddleware, createOrder);
router.get("/all-users", getallUser);

router.get("/wishlist", authMiddleware,getWishlist); // cai nay phai dung phia truoc get("/:id")
router.get("/cart", authMiddleware,getUserCart);

router.get("/:id", authMiddleware ,isAdmin,getaUser);
router.delete("/empty-cart", authMiddleware ,emptyCart);

router.delete("/:id", deleteaUser);
router.put("/order/update-order/:id", authMiddleware ,isAdmin, updateOrderStatus);

router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware,isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;