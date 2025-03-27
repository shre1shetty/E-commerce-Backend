import { UserSchema } from "../Models/Login.js";

export const LoginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserSchema.findOne({ username, password });
    if (!user) {
      res.json({
        statusCode: 404,
        statusMsg: "Invalid Username or password",
      });
    }
    res.json({
      loginRole: user.loginRole,
      redirectTo: user.redirectTo,
    });
  } catch (error) {
    res.status().json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};
