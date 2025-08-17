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
    });
    await newRating.save();
    res
      .status(201)
      .json({ message: "Rating added successfully", rating: newRating });
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
    })
      .populate("userId", "username email")
      .lean();
    res.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
