import mongoose from "mongoose";

const VariantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    fields: [
      {
        name: {
          type: String,
          unique: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Variants = mongoose.model("Variants", VariantSchema, "Variants");
