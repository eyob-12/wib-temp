const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const mongoose = require('mongoose');

// Fetch user's wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID from JWT token
        const wishlistItems = await Wishlist.find({ userId });

        if (!wishlistItems || wishlistItems.length === 0) {
            return res.json([]);
        }

        const productIds = wishlistItems.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        res.json(products);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "An error occurred while fetching the wishlist." });
    }
};

// Add a product to the wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const wishlist = await Wishlist.create({ userId, productId });
        res.json(wishlist);
    } catch (error) {
        console.error("Error adding product to wishlist:", error);
        res.status(500).json({ message: 'An error occurred while adding the product to the wishlist.' });
    }
};

// Remove a product from the wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const wishlistItem = await Wishlist.findOneAndDelete({ userId, productId });
        if (!wishlistItem) {
            return res.status(404).json({ message: 'Product not found in your wishlist' });
        }

        res.json({ message: 'Product removed from wishlist successfully' });
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        res.status(500).json({ message: 'An error occurred while removing the product from the wishlist.' });
    }
};

// Get total number of items in the wishlist
const getWishlistTotal = async (req, res) => {
    try {
        const userId = req.user.id;
        const totalWishlistItems = await Wishlist.countDocuments({ userId });
        res.json({ total: totalWishlistItems });
    } catch (error) {
        console.error("Error fetching total wishlist items:", error);
        res.status(500).json({ message: 'An error occurred while fetching the total number of wishlist items.' });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlistTotal
};
