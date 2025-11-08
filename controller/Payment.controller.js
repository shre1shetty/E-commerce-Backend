import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../Models/Order.js";
import { workFlowDefination } from "../Models/WorkFlowDefination.js";
import { WorkFlowModal } from "../Models/WorkFlowHistory.js";
import { Products } from "../Models/ProductToDisplay.js";
import { Cart } from "../Models/Cart.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Math.random()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    res.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).send(error);
  }
};

export const verifyOrder = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const { orderId, paymentId, paymentMethod } = req.body;
    if (!orderId || !paymentId || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const nextStageId = await workFlowDefination.findOne({
      stageFrom: req.body.statusId,
    });
    if (!nextStageId) {
      return res.status(400).json({ message: "Invalid statusId" });
    }
    req.body.statusId = nextStageId.stageTo;
    const order = new Order(req.body);
    await order.save().catch((error) => {
      console.error("Error saving order:", error);
      res.status(500).json({ message: "Internal server error" });
    });
    const workFlowEntry = new WorkFlowModal({
      workFlowStatusId: nextStageId._id,
      createdBy: req.body.userId,
      remarks: "Order placed",
      orderId: order._id,
    });
    await workFlowEntry.save().catch((error) => {
      console.error("Error saving workflow history:", error);
    });
    await Promise.all(
      req.body.products.map(async ({ productId, variant, quantity }) => {
        await Products.findOneAndUpdate(
          { _id: productId, "variantValues._id": variant },
          {
            $inc: {
              "variantValues.$.values.inStock": -quantity,
              "variantValues.$.values.sold": quantity,
              sold: quantity,
            },
          }
        );
      })
    );
    await Cart.deleteMany({
      userId: new mongoose.Types.ObjectId(req.body.userId),
    });
    res.status(201).json({ message: "Order confirmed successfully", order });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
