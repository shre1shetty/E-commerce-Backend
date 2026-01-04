import mongoose from "mongoose";
import { Products } from "./ProductToDisplay.js";

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    pictures: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

ratingSchema.post("save", async function () {
  try {
    await Products.findOneAndUpdate(
      { _id: this.productId, vendorId: this.vendorId },
      [
        {
          $set: {
            ratingSum: { $add: [{ $ifNull: ["$ratingSum", 0] }, this.rating] },
            ratingCount: { $add: [{ $ifNull: ["$ratingCount", 0] }, 1] },
          },
        },
        {
          $set: {
            avgRating: {
              $round: [{ $divide: ["$ratingSum", "$ratingCount"] }, 1],
            },
          },
        },
      ]
    );
  } catch (err) {
    console.error("Failed to update product rating:", err);
  }
});

export const Rating = mongoose.model("Rating", ratingSchema, "Ratings");
