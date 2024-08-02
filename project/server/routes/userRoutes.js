const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const EmailHelper = require("../utils/emailSender");

const router = express.Router();

// Function for OTP generation
const otpGenerator = () => Math.floor(Math.random() * 100000 + 90000);

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "The user already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPwd = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashPwd;

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "You've successfully signed up, please login now!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist. Please register.",
      });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password entered!",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.secret_key_jwt, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      message: "You've successfully logged in!",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
});

// router-level-middleware
router.get("/get-current-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "You are authorized to go to the protected route!",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user data.",
    });
  }
});

// Forgot password
router.patch("/forgetpassword", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter the email for forgot password.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for this email.",
      });
    }

    const otp = otpGenerator();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    await EmailHelper("otp.html", user.email, {
      name: user.name,
      otp: otp,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
});

router.patch("/resetpassword", async (req, res) => {
  try {
    const { otp, password } = req.body;
    if (!otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid request.",
      });
    }

    const user = await User.findOne({ otp });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password.",
    });
  }
});

module.exports = router;
