import mongoose from "mongoose";

const FilterSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    subFilter: [
      {
        name: {
          type: String,
          unique: true,
        },
        image: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Filters = mongoose.model("Filters", FilterSchema, "Filters");
