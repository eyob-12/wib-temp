const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Middleware to handle authentication
const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];

        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                if (!user) {
                    res.status(404);
                    throw new Error("User not found");
                }
                req.user = user;
                next();
            }
        } catch (error) {
            res.status(401);
            throw new Error("Not Authorized, token expired. Please login again.");
        }
    } else {
        res.status(401);
        throw new Error("No token provided in header.");
    }
});

// Middleware to verify admin role
const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });

    if (adminUser.role !== "admin") {
        res.status(403);
        throw new Error("Access denied, not an admin.");
    } else {
        next();
    }
});

// Middleware to verify delivery boy role
const isDeliveryBoy = asyncHandler(async (req, res, next) => {
    const { role } = req.user;

    if (role === "deliveryBoy") {
        next();
    } else {
        res.status(403);
        throw new Error("Access denied, not a delivery boy.");
    }
});

module.exports = { authMiddleware, isAdmin, isDeliveryBoy };
