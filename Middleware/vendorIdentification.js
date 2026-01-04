import { Vendor } from "../Models/Vendor.js";

export const resolveVendorByDomain = async (req, res, next) => {
  const host = req.hostname.toLowerCase();
  // removes port automatically

  const vendor = await Vendor.findOne({
    domains: { $in: host },
  }).lean();

  if (!vendor) {
    return res.status(404).json({
      message: "Store not found",
    });
  }
  req.vendor = vendor._id;
  next();
};
