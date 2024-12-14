const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../utils/createToken");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../utils/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const { createPasswordResetToken } = require("../models/User");
//new
const { validationResult } = require("express-validator");

const createUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, role, mobile } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new Error("User already exists with this email.");
  }

  const userRole = role ? role : "user";
  const otpPassword = generateOTP();


  const newUser = new User({
    firstname,
    lastname,
    email: email.toLowerCase().trim(),
    role: userRole,
    mobile,
    password: otpPassword,
  });

  const token = generateToken(newUser._id);
  const resetUrl = `${process.env.base_url}reset-password?token=${token}`;
  console.log(resetUrl);

  const message = `Your OTP for email verification is: ${resetUrl}\nYour temporary password is: ${otpPassword}`;
  await sendEmail({
    email: newUser.email,
    subject: "Email Verification OTP",
    message,
  });

  await newUser.save();

  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email using the OTP sent to your email.",
    user: {
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      mobile: newUser.mobile,
      role: newUser.role,
    },
  });
});

// Function to generate a 6-digit OTP password
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}


const changePassword = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "fail", message: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const { token } = req.params;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      console.log(userId)

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: "fail", message: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ status: "fail", message: "Current password is incorrect" });
      }


      user.password = newPassword;
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Password reset successfully",
      });
    } catch (err) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
};


const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      emailVerificationExpires: { $gt: Date.now() }, // Check if OTP is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== user.emailVerificationOTP) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const otpPassword = generateOTP();

  const token = generateToken(user._id);
  const resetUrl = `${process.env.base_url}reset-password?token=${token}`;


  user.password = otpPassword;
  await user.save();


  const message = `Your OTP for email verification is: ${resetUrl}\nYour temporary password is: ${otpPassword}`;
  try {
    // Send OTP via email (or SMS)
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      message,
    });

    res.status(200).json({ message: "OTP has been sent to your email." });
  } catch (error) {
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res
      .status(500)
      .json({ message: "Error in sending OTP. Try again later." });
  }
});




const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Hash the provided OTP to match it with the stored one
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  // Check if the OTP is correct and not expired
  if (
    user.passwordResetOTP !== hashedOTP ||
    Date.now() > user.passwordResetExpires
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  res
    .status(200)
    .json({ message: "OTP verified. You can now reset your password." });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }
  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res
    .status(200)
    .json({ message: "Password reset successfully. You can now log in." });
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const findUser = await User.findOne({ email });

  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser._id);

    // Update the user's refresh token in the database
    const updateUser = await User.findByIdAndUpdate(
      findUser._id,
      { refreshToken: refreshToken },
      { new: true }
    );

    // Set the refresh token as a cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 3 days
    });

    // Send response with user details including the role
    res.json({
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      role: findUser.role, // Add the role to the response
      token: generateToken(findUser._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});


const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user

const updatedUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, mobile, email } = req.body.profileInfo;

  console.log(firstname)
  validateMongoDbId(id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: firstname,
        lastname: lastname,
        mobile: mobile,
        email: email


      },
      {
        new: true,
      }
    );

    res.json(updatedUser);



  } catch (error) {
    throw new Error(error);
  }
});

// save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate("wishlist");
    console.log(getUsers)
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    //review this
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});



// delivery boy const getDeliveryBoys = async (req, res) => {
const getDeliveryBoys = async (req, res) => {
  const deliveryBoys = await User.find({ role: "deliveryBoy" });
  res.status(200).json(deliveryBoys);
};

// Assign Order to Delivery Boy
const assignOrderToDeliveryBoy = async (req, res) => {
  const { orderId } = req.params;
  const { deliveryBoyId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found." });

  order.deliveryBoy = deliveryBoyId;
  await order.save();

  res.status(200).json({ success: true, message: "Order assigned to delivery boy." });
};

// Update Delivery Boy
const updateDeliveryBoy = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedDeliveryBoy = await User.findByIdAndUpdate(id, updates, { new: true });
  res.status(200).json(updatedDeliveryBoy);
};

// Delete Delivery Boy
const deleteDeliveryBoy = async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);
  res.status(204).json({ message: "Delivery boy deleted successfully." });
};

















const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();

    await user.save();
    console.log(token);
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:3000/reset-password/${token}'>Click Here</>`;

    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  console.log("🚀 ~ addToWishlist ~ productId:", productId);
  const { _id } = req.user;
  console.log("🚀 ~ addToWishlist ~ _id:", _id);

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  if (!_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    // Filter out null or undefined values in the wishlist
    user.wishlist = user.wishlist.filter((item) => item != null);

    // Check if the product is already in the wishlist
    const isProductInWishlist = user.wishlist.some((item) =>
      item.equals(productId)
    );

    if (isProductInWishlist) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Add product to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.status(201).json({ message: "Product added to wishlist successfully" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { id: productId } = req.params; // Assuming productId is sent as URL parameter
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist.filter((item) => !item.equals(productId));
    await user.save();
    res.json({ message: "Product removed from wishlist successfully" });
  } catch (error) {
    console.error("Failed to remove product from wishlist:", error);
    res.status(500).json({
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { productId, color, quantity, price } = req.body;

  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let newCart = await new Cart({
      userId: _id,
      productId,
      color,
      price,
      quantity,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id })
      .populate("productId")
      .populate("color");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  validateMongoDbId(_id);
  try {
    const deleteProductFromcart = await Cart.deleteOne({
      userId: _id,
      _id: cartItemId,
    });

    res.json(deleteProductFromcart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const deleteCart = await Cart.deleteMany({
      userId: _id,
    });

    res.json(deleteCart);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      userId: _id,
      _id: cartItemId,
    });
    cartItem.quantity = newQuantity;
    cartItem.save();
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    totalPrice,
    currency,
    email,
    first_name,
    last_name,
    phone_number,
    address,
    country,
    city,
    postalCode,
    callback_url,
    totalPriceAfterDiscount,
    return_url,
    cart,
  } = req.body;

  if (!first_name || !last_name || !phone_number || !country) {
    return res.status(400).json({
      message: "Validation error: Missing required fields",
    });
  }

  try {
    const { _id } = req.user;

    validateMongoDbId(_id);
    const newOrder = new Order({
      user: _id,
      currency,
      first_name,
      last_name,
      email,
      phone_number,
      address,
      city,
      postalCode,
      tx_ref: "pending for eyob-12",
      cart,
      callback_url,
      return_url,
      country,
      totalPrice,
      totalPriceAfterDiscount,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.find({ user: _id })
      .populate("user")
      .populate("cart.product");

    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.find().populate("user");
    // .populate("orderItems.product")
    // .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getsingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.findOne({ _id: id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrder = async (req, res) => {
  const { deliveryBoyId, status } = req.body; // Extract deliveryBoyId and status

  try {
    // Log the incoming request body
    console.log('Request Body:', req.body);

    // Find the order by ID
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    console.log('Before Update:', order); // Log order before update

    // Assign delivery boy if provided
    if (deliveryBoyId) {
      console.log('Assigning Delivery Boy:', deliveryBoyId);
      const deliveryBoy = await User.findOne({ _id: deliveryBoyId, role: 'deliveryBoy' });
      if (!deliveryBoy) {
        return res.status(404).json({ status: 'error', message: 'Delivery Boy not found' });
      }
      order.assignedTo = deliveryBoyId; // Assign delivery boy
    }

    // Update the order status if provided
    if (status) {
      console.log('Updating Order Status:', status); // Log the new status
      order.orderStatus = status; // Update order status
    }

    // Save the updated order
    const updatedOrder = await order.save();
    console.log('After Update:', updatedOrder); // Log order after update

    // Populate the assignedTo field with delivery boy's details
    const populatedOrder = await Order.findById(updatedOrder._id).populate('assignedTo', 'first_name last_name email phone_number');

    return res.json({ status: 'success', message: 'Order updated successfully', order: populatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};





const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        amount: { $sum: "$totalPriceAfterDiscount" },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(data);
});

const getYearlyTotalOrder = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        amount: { $sum: 1 },
        amount: { $sum: "$totalPriceAfterDiscount" },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(data);
});


//new 



const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: "Role query parameter is required" });
  }

  try {
    const users = await User.find({ role: role });

    if (!users.length) {
      return res.status(404).json({ message: `No users found with role ${role}` });
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


const getUserCount = async (req, res) => {
  try {
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the response
    const counts = userCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Send the response
    res.status(200).json({
      success: true,
      data: {
        merchant: counts.merchant || 0,
        admin: counts.admin || 0,
        deliveryBoy: counts.deliveryBoy || 0,
        user: counts.user || 0,
      },
    });

    // Remove undefined logging
    console.log("User counts successfully fetched");
  } catch (error) {
    // Send the error response
    res.status(500).json({
      success: false,
      message: "Error fetching user counts",
      error: error.message,
    });

    console.error("Error fetching user counts:", error.message);
  }
};

module.exports = {
  createUser,
  verifyEmail,
  forgotPassword,
  verifyOTP,
  resetPassword,
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
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  saveAddress,
  userCart,
  getUserCart,
  createOrder,
  getMyOrders,
  emptyCart,
  getMonthWiseOrderIncome,
  getAllOrders,
  getsingleOrder,
  updateOrder,
  getYearlyTotalOrder,
  removeProductFromCart,
  updateProductQuantityFromCart,
  getDeliveryBoys,
  assignOrderToDeliveryBoy,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  // new
  changePassword,
  getUsersByRole,
  getUserCount,
};
