import mongoose from "mongoose";
import { Order } from "../Models/Order.js";

export const getAdminOrders = async (req, res) => {
  try {
    const condition =
      req.query.type === "unfulfilled"
        ? { vendorId: req.vendor, isRejected: false, isCompleted: false }
        : req.query.type === "fulfilled"
          ? {
              vendorId: req.vendor,
              isCompleted: true,
            }
          : { vendorId: req.vendor, isRejected: true };
    const orders = await Order.find(condition)
      .populate([
        {
          path: "userId",
          select: "username email",
        },
        {
          path: "products.productId",
          select: "name",
        },
        {
          path: "status",
        },
      ])
      .select("-__v -vendorId")
      .lean({ virtuals: true });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAdminOrdersById = async (req, res) => {
  try {
    const { id } = req.body;
    const orders = await Order.findOne({ _id: id, vendorId: req.vendor })
      .populate([
        {
          path: "userId",
          select: "username email contactNumber",
        },
        {
          path: "products.productId",
          populate: { path: "productType", select: "name" },
        },
        {
          path: "status",
        },
      ])
      .select("-__v -vendorId")
      .lean({ virtuals: true });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersbyType = async (req, res) => {
  try {
    const { type, userId } = req.body;
    let unfilteredOrders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
      vendorId: req.vendor,
    })
      .populate([
        {
          path: "userId",
          select: "username email contactNumber",
        },
        {
          path: "products.productId",
          select: "brand fabric fitType name price variantValues variantFields",
        },
        {
          path: "status",
        },
      ])
      .sort({ createdAt: -1 })
      .select("-__v -vendorId")
      .lean({ virtuals: true });
    if (type === "Current") {
      res.status(200).json(
        unfilteredOrders
          .filter((order) => !order.status.finalStage && !order.isRejected)
          .map((val) => ({
            ...val,
            products: val.products.map(({ quantity, productId, variant }) => {
              const variantField = productId.variantValues.find(
                ({ _id }) => _id.toString() === variant.toString(),
              );
              return {
                quantity,
                name: productId.name,
                variantFields: productId.variantFields,
                variantName: variantField.name,
                price: variantField.values.price,
                picture: variantField.values.picture[0],
              };
            }),
          })),
      );
    } else if (type === "Fulfilled") {
      res.status(200).json(
        unfilteredOrders
          .filter((order) => order.status.finalStage)
          .map((val) => ({
            ...val,
            products: val.products.map(({ quantity, productId, variant }) => {
              const variantField = productId.variantValues.find(
                ({ _id }) => _id.toString() === variant.toString(),
              );
              return {
                quantity,
                name: productId.name,
                variantFields: productId.variantFields,
                variantName: variantField.name,
                price: variantField.values.price,
                picture: variantField.values.picture[0],
              };
            }),
          })),
      );
    } else {
      res.status(200).json(
        unfilteredOrders.map((val) => ({
          ...val,
          products: val.products.map(({ quantity, productId, variant }) => {
            const variantField = productId.variantValues.find(
              ({ _id }) => _id.toString() === variant.toString(),
            );
            return {
              quantity,
              name: productId.name,
              variantFields: productId.variantFields,
              variantName: variantField.name,
              price: variantField.values.price,
              picture: variantField.values.picture[0],
            };
          }),
        })),
      );
    }
  } catch (error) {
    console.error("Error fetching orders: ", error);
    res.status(500).json({ message: error.message });
  }
};
