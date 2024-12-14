const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "merchant", "deliveryBoy", "user"], // Define all possible roles
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  
    address: {
      type: String,
    },
    ProfilePicture: [
      {
        public_id: { type: String, required: false },
        secure_url: { type: String, required: false },
      },],
    emailVerificationOTP: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetOTP: { type: String },
    passwordResetExpires: { type: Date },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  return otp; // Send this plain OTP to the user
};

userSchema.methods.createEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  this.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  return otp;
};

//Export the model
module.exports = mongoose.model("User", userSchema);
