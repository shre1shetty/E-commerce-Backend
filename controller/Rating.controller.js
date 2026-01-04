import mongoose from "mongoose";
import { Rating } from "../Models/Rating.js";
export const addRating = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;
    const pictures = req.files ? req.files.map((file) => file.id) : [];
    const newRating = new Rating({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      rating,
      comment,
      pictures,
      vendorId: req.vendor,
    });
    await newRating.save();
    res.status(201).json({
      status: 200,
      message: "Rating added successfully",
      rating: newRating,
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRatingsByProductId = async (req, res) => {
  try {
    const { productId } = req.query;
    const ratings = await Rating.find({
      productId: new mongoose.Types.ObjectId(productId),
      vendorId: req.vendor,
    })
      .populate("userId", "username email")
      .select("-vendorId")
      .lean();
    res.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecentRatings = async (req, res) => {
  try {
    const ratings = await Rating.aggregate([
      {
        $match: { vendorId: req.vendor },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "Users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $project: {
          comment: 1,
          createdAt: 1,
          rating: 1,
          productId: 1,
          username: "$userId.username",
          email: "$userId.email",
        },
      },
    ]);
    res.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
