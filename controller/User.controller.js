import { User } from "../Models/User.js";
import { generateTokens } from "../Utils/token.js";
import jwt from "jsonwebtoken";

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
        { username: username, password: password },
        { email: username, password: password },
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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);

        const { accessToken } = generateTokens(user);
        res.json({ accessToken, role: user.role });
      }
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
  const { refreshToken } = req.cookies;
  await User.updateOne({ refreshToken }, { $unset: { refreshToken: "" } });
  res.json({ message: "Logged out" });
};
