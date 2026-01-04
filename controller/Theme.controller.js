import { Layout } from "../Models/Layout.js";

export const getUserTheme = async (req, res) => {
  try {
    const theme = await Layout.findOne({
      isActive: true,
      vendorId: req.vendor,
    }).select("themeColor");
    res.json(theme);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};
