import mongoose from "mongoose";
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
      { userId, vendorId: req.vendor },
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
    if (!userId) {
      return res.status(400).json({ message: "Please login first !" });
    }
    const cart = await Cart.findOne({ userId, vendorId: req.vendor })
      .populate("products.productId")
      .lean();

    // const cart = await Cart.aggregate([
    //   {
    //     $match: { userId: new mongoose.Types.ObjectId(userId) },
    //   },
    //   {
    //     $lookup: {
    //       from: "Products",
    //       let: { productIds: "$products.productId" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: { $in: ["$_id", "$$productIds"] },
    //           },
    //         },
    //         {
    //           $lookup: {
    //             from: "Variants",
    //             localField: "productType",
    //             foreignField: "_id",
    //             as: "Variants",
    //           },
    //         },
    //         {
    //           $unwind: "$Variants",
    //         },
    //         {
    //           $addFields: {
    //             gstSlab: {
    //               $arrayElemAt: [
    //                 {
    //                   $filter: {
    //                     input: "$category.gstSlabs",
    //                     as: "slab",
    //                     cond: {
    //                       $and: [
    //                         { $gte: ["$price", "$$slab.minPrice"] },
    //                         {
    //                           $or: [
    //                             { $eq: ["$$slab.maxPrice", null] },
    //                             { $lte: ["$price", "$$slab.maxPrice"] },
    //                           ],
    //                         },
    //                       ],
    //                     },
    //                   },
    //                 },
    //                 0,
    //               ],
    //             },
    //           },
    //         },
    //       ],
    //       // localField: "products.productId",
    //       // foreignField: "_id",
    //       as: "productDocs",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       products: {
    //         $map: {
    //           input: "$products",
    //           as: "prod",
    //           in: {
    //             $mergeObjects: [
    //               "$$prod",
    //               {
    //                 productId: {
    //                   $mergeObjects: [
    //                     {
    //                       $arrayElemAt: [
    //                         {
    //                           $filter: {
    //                             input: "$productDocs",
    //                             as: "pd",
    //                             cond: { $eq: ["$$pd._id", "$$prod.productId"] },
    //                           },
    //                         },
    //                         0,
    //                       ],
    //                     },
    //                     { GST: 10 },
    //                   ],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: { productDocs: 0, createdAt: 0, updatedAt: 0, __v: 0 },
    //   },
    // ]);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error while fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCartCount = async (req, res) => {
  try {
    const { userId } = req.query;
    const products = await Cart.aggregate([
      {
        $match: {
          $and: [
            { userId: new mongoose.Types.ObjectId(userId) },
            { vendorId: req.vendor },
          ],
        },
      },
      {
        $project: {
          count: { $size: "$products" },
        },
      },
    ]);
    res
      .status(200)
      .json({ count: products.length > 0 ? products[0].count : 0 });
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
        { userId, "products._id": _id, vendorId: req.vendor },
        {
          $set: {
            "products.$.quantity": quantity,
          },
        },
        { new: true }
      )
        .populate("products.productId")
        .select("-vendorId")
        .lean();
      return res.status(200).json(updatedValues);
    } else {
      const updatedValues = await Cart.findOneAndUpdate(
        {
          userId,
          vendorId: req.vendor,
        },
        {
          $pull: { products: { _id } },
        },
        { new: true }
      )
        .populate("products.productId")
        .select("-vendorId")
        .lean();
      return res.status(200).json(updatedValues);
    }
  } catch (error) {
    console.error("Error while changing Quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
