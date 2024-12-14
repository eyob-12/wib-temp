const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require('mongoose');

// Get user's cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;  // Assuming user is authenticated

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        console.log("Fetching cart for User ID:", userId); // Log userId

        // Fetch cart items for the user, including related product details
        const cartItems = await Cart.find({ userId }).populate('productId');

        // Log the retrieved cart items
        console.log("Cart Items:", cartItems);

        // If no items are found, return an empty array
        if (cartItems.length === 0) {
            return res.status(200).json({ cart_items: [] });
        }

        // Return the cart items with product details
        res.status(200).json({ cart_items: cartItems });

    } catch (error) {
        console.error("Error fetching cart items:", error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred' });
    }
};
// Add product to cart
const addToCart = async (req, res) => {
    const { productId, selectedColor, selectedSize } = req.body;
    const userId = req.user.id;

    try {
        // Check if the product is already in the cart
        const existingItem = await Cart.findOne({ userId, productId, selectedColor, selectedSize });

        if (existingItem) {
            // If it exists, update the quantity
            existingItem.quantity += 1; // Increment quantity by 1 or adjust as needed
            await existingItem.save();
            return res.status(200).json(existingItem); // Return the updated item
        }

        // Create a new cart item
        const newCartItem = new Cart({
            userId,
            productId,
            quantity: 1, // Set initial quantity to 1
            selectedColor,
            selectedSize,
        });

        await newCartItem.save();
        res.status(201).json(newCartItem); // Return the newly added item
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: "Error adding product to cart" });
    }
};
// Increase cart quantity
const increaseCartQuantity = async (req, res) => {
    const { productId } = req.body; // Extract product ID from request body
    const userId = req.user.id; // Assuming `req.user` contains authenticated user information

    try {
        // Find the cart item for the specified user and product
        const cartItem = await Cart.findOne({ userId, productId });

        // If the cart item doesn't exist, send a 404 response
        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Increase the quantity of the product
        cartItem.quantity += 1;
        await cartItem.save(); // Save the updated cart item to the database

        // Send a successful response with the updated cart item
        res.status(200).json(cartItem);
    } catch (error) {
        // Send an error response in case of any failure
        res.status(500).json({ message: "Error increasing quantity" });
    }
};




// Decrease cart quantity
const decreaseCartQuantity = async (req, res) => {
    const { productId } = req.body; // Get the product ID from the request body
    const userId = req.user.id; // Assuming `req.user` contains authenticated user information

    try {
        // Find the cart item for the specific user and product
        const cartItem = await Cart.findOne({ userId, productId });

        // If the item is not found in the cart, return a 404 response
        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // If the item quantity is more than 1, reduce the quantity
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
            await cartItem.save(); // Save the updated cart item to the database
            return res.status(200).json(cartItem); // Send the updated cart item back as response
        } else {
            // If the quantity is 1, remove the item from the cart
            await cartItem.remove();
            return res.status(200).json({ message: "Product removed from cart" });
        }
    } catch (error) {
        // In case of an error, send a 500 response with an error message
        res.status(500).json({ message: "Error decreasing quantity" });
    }
};


// Remove product from cart
const removeFromCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    // Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
    }

    try {
        // Find and delete the cart item with the matching userId and productId
        const cartItem = await Cart.findOneAndDelete({ userId, productId });

        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Return success message if item is deleted
        res.status(200).json({ message: "Product removed from cart" });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Error removing product from cart", error });
    }
};


// Get cart total quantity
// cartController.js

const getCartTotal = async (req, res) => {
    const userId = req.user?.id;

    //console.log("User ID:", userId); // Log userId

    if (!userId) {
        return res.status(400).json({ message: 'User ID is missing' });
    }

    try {
        // Convert userId to ObjectId if it's a string
        const userObjectId = new mongoose.Types.ObjectId(userId);
        //console.log("User ObjectId:", userObjectId); // Log ObjectId

        // Aggregate to get the total quantity
        const totalQuantity = await Cart.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
        ]);

        console.log("Total Quantity:", totalQuantity); // Log totalQuantity

        res.status(200).json({
            total_quantity: totalQuantity[0] ? totalQuantity[0].totalQuantity : 0
        });
    } catch (error) {
        console.error("Error fetching cart total:", error); // Log the error for debugging
        res.status(500).json({ message: "Error fetching cart total" });
    }
};
const clearCart = async (req, res) => {
    const userId = req.user.id; // Assuming user is authenticated

    if (!userId) {
        return res.status(400).json({ message: 'User ID is missing' });
    }

    try {
        // Remove all cart items for the user
        await Cart.deleteMany({ userId });

        // Return a success message
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error("Error clearing cart:", error); // Log the error for debugging
        res.status(500).json({ message: "Error clearing cart" });
    }
};

module.exports = {
    clearCart,
    getCart,
    addToCart,
    getCartTotal,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeFromCart,
    getCartTotal
};
