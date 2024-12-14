// registerController.js
const token=require("../utils/createToken")
const sendVerificationEmail = require("../utils/emailSend");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      role,
      verificationExpires: new Date(Date.now() + 24*60 * 60 * 1000), // 1 hour from now
      isVerified: false,
     
    });

    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;

    // Send verification email
    await sendVerificationEmail(newUser.email, resetUrl);
    

    res.status(201).json({ message: "User registered. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error: "Error registering user." });
  }
};

module.exports = {
    registerUser
    
};