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
        showOnSearch: {
          type: Boolean,
          default: false,
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

export const Filters = mongoose.model("Filters", FilterSchema, "Filters");
