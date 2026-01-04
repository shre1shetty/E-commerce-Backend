import mongoose from "mongoose";
import { WishList } from "../Models/Wishlist.js";

export const addToWishlist = async (req, res) => {
  try {
    req.body.vendorId = req.vendor;
    const wishlistItem = new WishList(req.body);
    await wishlistItem.save();
    res.status(200).json({
      message: "Record inserted succesfulluy",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while adding to wishlist",
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(404).json(req.body);
    const wishList = await WishList.find({
      userId: new mongoose.Types.ObjectId(userId),
      vendorId: req.vendor,
    }).select("productId -_id");
    res.status(200).json(wishList.map((item) => item.productId));
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching wishlists",
    });
  }
};

export const removeFromWishList = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400);
    await WishList.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      vendorId: req.vendor,
    });
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({
      message: "Error while deleting from wishlist",
    });
  }
};

export const getWishlistProductsByUserId = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(404);
    const wishlistProducts = await WishList.aggregate([
      {
        $match: {
          $and: [
            {
              userId: new mongoose.Types.ObjectId(userId),
            },
            {
              vendorId: req.vendor,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "Products",
          foreignField: "_id",
          localField: "productId",
          // let: { productId: "$productId" },
          // pipeline: [
          //   {
          //     $match: {
          //       $expr: { $eq: ["$_id", "$$productId"] },
          //     },
          //   },
          //   {
          //     $project: {
          //       __v: 0,
          //       createdAt: 0,
          //       updatedAt: 0,
          //       variantValues: 0,
          //       pictures: 0,
          //       Title: 0,
          //       productType: 0,
          //     },
          //   },
          //   {
          //     $project: {
          //       category: {
          //         $reduce: {
          //           input: "$category.label",
          //           initialValue: "",
          //           in: {
          //             $cond: [
          //               { $eq: ["$$value", ""] },
          //               "$$this",
          //               {
          //                 $concat: ["$$value", ",", "$$this"],
          //               },
          //             ],
          //           },
          //         },
          //       },
          //       variantFields: {
          //         $concat: [
          //           {
          //             $arrayElemAt: ["$variantFields.field", 0],
          //           },
          //           ":",
          //           {
          //             $reduce: {
          //               input: { $arrayElemAt: ["$variantFields.value", 0] },
          //               initialValue: "",
          //               in: {
          //                 $cond: [
          //                   { $eq: ["$$value", ""] },
          //                   "$$this",
          //                   { $concat: ["$$value", ",", "$$this"] },
          //                 ],
          //               },
          //             },
          //           },
          //           " ",
          //           {
          //             $arrayElemAt: ["$variantFields.field", 1],
          //           },
          //           ":",
          //           {
          //             $reduce: {
          //               input: { $arrayElemAt: ["$variantFields.value", 1] },
          //               initialValue: "",
          //               in: {
          //                 $cond: [
          //                   { $eq: ["$$value", ""] },
          //                   "$$this",
          //                   { $concat: ["$$value", ",", "$$this"] },
          //                 ],
          //               },
          //             },
          //           },
          //         ],
          //       },
          //     },
          //   },
          // ],
          as: "newProducts",
        },
      },
      {
        $unwind: "$newProducts",
      },
      {
        $replaceRoot: { newRoot: "$newProducts" },
      },
    ]);
    res.status(200).json(wishlistProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching wishlist",
    });
  }
};
