import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    summary: {
      subTotal: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      shipping: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

orderSchema.virtual("status", {
  ref: "WorkFlowDefination",
  localField: "statusId",
  foreignField: "stageFrom",
  justOne: true,
});

orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

export const Order = mongoose.model("Order", orderSchema, "Orders");
