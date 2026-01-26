import mongoose from "mongoose";
import { User } from "../Models/User.js";
import { generateTokens } from "../Utils/token.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../Utils/mailer.js";

export const addUser = async (req, res) => {
  try {
    if (!req.body.role) {
      req.body.role = "user";
    }
    const { username, password, email, role, contactNumber, address, pincode } =
      req.body;
    const newUser = new User({
      username,
      password,
      email,
      role,
      contactNumber,
      address,
      pincode,
      vendorId: req.vendor,
    });
    const user = await newUser.save();
    res
      .status(201)
      .json({ statusCode: 200, message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      $or: [
        {
          username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
          password: password,
          vendorId: req.vendor,
        },
        {
          email: { $regex: new RegExp(`^${username.trim()}$`, "i") },
          password: password,
          vendorId: req.vendor,
        },
        {
          username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
          password: password,
          role: "superadmin",
        },
        {
          email: { $regex: new RegExp(`^${username.trim()}$`, "i") },
          password: password,
          role: "superadmin",
        },
      ],
    });
    if (!user) {
      return res.json({
        statusCode: 404,
        statusMsg: "Invalid Username or password",
      });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();
    const { _doc } = user;
    delete _doc.password; // Remove password from response for security
    delete _doc.__v; // Remove version key from response
    delete _doc.createdAt; // Remove createdAt from response
    delete _doc.updatedAt; // Remove updatedAt from response
    delete _doc.refreshToken;
    delete _doc.vendorId;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "none",
    });
    const bodyToSend =
      process.env.NODE_ENV === "production"
        ? {
            ..._doc,
            accessToken,
            statusCode: 200,
            statusMsg: "Login successful",
          }
        : {
            ..._doc,
            accessToken,
            refreshToken,
            statusCode: 200,
            statusMsg: "Login successful",
          };
    res.json(bodyToSend);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } =
      process.env.NODE_ENV === "production" ? req.cookies : req.body;
    if (!refreshToken) return res.sendStatus(401);

    const user = await User.findOne({ refreshToken, vendorId: req.vendor });
    if (!user) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);

        const { accessToken } = generateTokens(user);
        res.json({ accessToken, role: user.role });
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    await User.updateOne(
      { refreshToken, vendorId: req.vendor },
      { $unset: { refreshToken: "" } },
    );
    res.json({ message: "Logged out" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getuserDetails = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId)
      res
        .status(400)
        .json({ statusCode: 400, statusMsg: "userId is required" });
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      vendorId: req.vendor,
    }).select("username email contactNumber");
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) res.status(400).json({ statusMsg: "userId is required" });
    const { username, email, contactNumber } = req.body;
    if (!username || !email || !contactNumber)
      res
        .status(400)
        .json({ statusMsg: "username,email and contactNumber are required" });
    await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId), vendorId: req.vendor },
      { username, email, contactNumber },
    );
    res.status(200).json({
      statusCode: 200,
      statusMsg: "User details updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId)
      res
        .status(400)
        .json({ statusCode: 400, statusMsg: "userId is required" });
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      res.status(400).json({
        statusCode: 400,
        statusMsg: "Old and New password is required",
      });

    User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      vendorId: req.vendor,
    }).then((user) => {
      if (user.password !== currentPassword) {
        return res
          .status(400)
          .json({ statusCode: 400, statusMsg: "Old password is incorrect" });
      } else {
        user.password = newPassword;
        user.save();
        return res.status(200).json({
          statusCode: 200,
          statusMsg: "Password updated successfully",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json("Email is required");
    console.log(req.vendor);
    const user = await User.findOne({
      email,
      vendorId: req.vendor,
    });
    if (!user)
      return res.status(404).json({
        statusCode: 404,
        statusMsg: "User with this email does not exist",
      });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      fromName: req.storeName,
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      replyTo: `${req.supportEmail}`,
    });
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; //10 minutes
    await user.save();
    res
      .status(200)
      .json({ statusCode: 200, statusMsg: "OTP sent to email successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const validateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ statusMsg: "Email and OTP are required", statusCode: 400 });
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gte: Date.now() },
      vendorId: req.vendor,
    });
    if (!user)
      return res
        .status(400)
        .json({ statusMsg: "OTP is invalid or expired", statusCode: 400 });
    res.status(200).json({
      statusCode: 200,
      statusMsg: "OTP validated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    if (!email || !newPassword || !otp)
      return res.json({
        statusCode: 400,
        statusMsg: "Email and new password are required",
      });
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gte: Date.now() },
      vendorId: req.vendor,
    });
    if (!user)
      return res.json({
        statusCode: 404,
        statusMsg: "User with this email does not exist",
      });
    user.password = newPassword;
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    await user.save();
    const { _doc } = user;
    delete _doc.password; // Remove password from response for security
    delete _doc.__v; // Remove version key from response
    delete _doc.createdAt; // Remove createdAt from response
    delete _doc.updatedAt; // Remove updatedAt from response
    delete _doc.refreshToken;
    delete _doc.vendorId;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "none",
    });
    const bodyToSend =
      process.env.NODE_ENV === "production"
        ? {
            ..._doc,
            accessToken,
            statusCode: 200,
            statusMsg: "Login successful",
          }
        : {
            ..._doc,
            accessToken,
            refreshToken,
            statusCode: 200,
            statusMsg: "Login successful",
          };
    res.json(bodyToSend);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};
