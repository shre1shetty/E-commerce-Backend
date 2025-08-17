import { Cart } from "../Models/Cart.js";

export const AddtoCart = async (req, res) => {
  try {
    const { userId, productId, quantity, price, variant } = req.body;

    // Validate input
    if (!userId || !productId || !quantity || !price || !variant) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new cart item
    const newCartItem = {
      productId,
      quantity,
      price,
      variant,
    };

    // Find the user's cart and update it
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $push: { products: newCartItem } },
      { new: true, upsert: true }
    );

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetCart = async (req, res) => {
  try {
    const { userId } = req.query;
    // if (!userId) {
    //   return res.status(400).json({ message: "User ID is required" });
    // }
    const cart = await Cart.findOne({ userId })
      .populate("products.productId")
      .lean();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error while fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCartCount = async (req, res) => {
  try {
    const { userId } = req.query;
    const count = await Cart.countDocuments({ userId });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error while fetching cart count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeQuantity = async (req, res) => {
  try {
    const { userId, _id, quantity } = req.body;
    if (quantity > 0) {
      const updatedValues = await Cart.findOneAndUpdate(
        { userId, "products._id": _id },
        {
          $set: {
            "products.$.quantity": quantity,
          },
        },
        { new: true }
      )
        .populate("products.productId")
        .lean();
      return res.status(200).json(updatedValues);
    } else {
      const updatedValues = await Cart.findOneAndUpdate(
        {
          userId,
        },
        {
          $pull: { products: { _id } },
        },
        { new: true }
      )
        .populate("products.productId")
        .lean();
      return res.status(200).json(updatedValues);
    }
  } catch (error) {
    console.error("Error while changing Quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
