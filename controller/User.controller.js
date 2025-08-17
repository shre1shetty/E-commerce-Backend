import { User } from "../Models/User.js";

export const addUser = async (req, res) => {
  try {
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
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
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
    const { _doc } = user;
    delete _doc.password; // Remove password from response for security
    delete _doc.__v; // Remove version key from response
    delete _doc.createdAt; // Remove createdAt from response
    delete _doc.updatedAt; // Remove updatedAt from response
    res.json({
      ..._doc,
      statusCode: 200,
      statusMsg: "Login successful",
    });
  } catch (error) {
    res.status().json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};
