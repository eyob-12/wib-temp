const express = require("express");
const {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    //new 
    getStoreProducts,
    getProductCountByCategory,
    fetchRecentProducts,
    EachMerchantProducts,
    AllGetProductCountByCategory,
    AllfetchRecentProducts,
    AllMerchantProducts,
} = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();


//new 
router.get("/MerchantdashBoard",AllGetProductCountByCategory);
router.get("/MerchantdashBoard/:id",getProductCountByCategory)
router.get('/recent', AllfetchRecentProducts);
router.get('/recent/:id', fetchRecentProducts);
router.get('/AllProduct/:id', EachMerchantProducts);
router.get("/store/:id", getStoreProducts);



router.post("/", createProduct);

router.get("/:id", getaProduct);

router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.get("/", getAllProduct);



module.exports = router;