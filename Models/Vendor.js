import mongoose from "mongoose";
import { decrypt, encrypt } from "../Utils/crypto.js";
const VendorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    storeName: {
      type: String,
      required: true,
    },

    domains: {
      type: [String], // ["xyz.com", "www.xyz.com"]
      required: true,
      lowercase: true,
      index: true,
    },

    supportEmail: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
      index: true,
    },

    payment: {
      razorpay: {
        keyId: { type: String, required: true },
        secret: { type: String, required: true },
      },
    },

    analytics: {
      ga4: {
        propertyId: { type: String },
        clientEmail: { type: String },
        privateKey: { type: String },
      },
    },
  },
  { timestamps: true }
);

VendorSchema.pre("save", function (next) {
  if (!this.isModified("payment.razorpay.secret")) {
    return next();
  }

  this.payment.razorpay.secret = encrypt(this.payment.razorpay.secret);

  next();
});

VendorSchema.methods.getRazorpaySecret = function () {
  return decrypt(this.payment.razorpay.secret);
};

export const Vendor = mongoose.model("Vendor", VendorSchema);
