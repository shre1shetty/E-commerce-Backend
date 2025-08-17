import { Order } from "../Models/Order.js";

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate([
        {
          path: "userId",
          select: "username email",
        },
        {
          path: "products",
          select: "name",
        },
        {
          path: "status",
        },
      ])
      .select("-__v")
      .lean({ virtuals: true });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders: ", error);
    res.status(500).json({ message: error.message });
  }
};
