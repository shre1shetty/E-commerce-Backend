import mongoose from "mongoose";

const VariantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    gstSlabs: [
      {
        minPrice: { type: Number, required: true },
        maxPrice: { type: Number },
        gstPercentage: { type: Number, required: true },
        _id: false,
      },
    ],
    fields: [
      {
        name: {
          type: String,
          unique: true,
        },
        flag: {
          type: String,
        },
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

export const Variants = mongoose.model("Variants", VariantSchema, "Variants");
