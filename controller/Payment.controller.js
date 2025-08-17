import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../Models/Order.js";

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

export const confirmOrder = (req, res) => {
  try {
    const { orderId, paymentId, paymentMethod } = req.body;
    if (!orderId || !paymentId || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new Order(req.body);
    order
      .save()
      .then(() => {
        res
          .status(201)
          .json({ message: "Order confirmed successfully", order });
      })
      .catch((error) => {
        console.error("Error saving order:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    clg.error("Error confirming order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
