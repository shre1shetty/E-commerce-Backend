import { Vendor } from "../Models/Vendor.js";

export const resolveVendorByDomain = async (req, res, next) => {
  const host = req.headers["x-store-domain"] || req.hostname.toLowerCase();
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
  req.GA4_CLIENT_EMAIL = vendor.analytics.ga4.clientEmail;
  req.GA4_PRIVATE_KEY = vendor.analytics.ga4.privateKey;
  req.GA4_PROPERTY_ID = vendor.analytics.ga4.propertyId;
  req.RAZORPAY_KEY_ID = vendor.payment.razorpay.keyId;
  req.RAZORPAY_SECRET = vendor.payment.razorpay.secret;
  req.supportEmail = vendor.supportEmail;
  next();
};
