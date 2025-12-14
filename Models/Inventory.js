import mongoose from "mongoose";
const InventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    inStock: {
      type: Number,
      required: true,
      min: 1,
      set: (value) => (value == null ? 1 : parseInt(value)),
    },
    sold: {
      type: Number,
      default: 0,
      set: (value) => (value == null ? 0 : value),
    },
    category: {
      type: String,
      required: true,
    },
    fabric: {
      type: String,
    },
    brand: {
      type: String,
    },
    fitType: {
      type: String,
    },
  },
  { strict: false },
  { timestamps: true }
);

export const Inventory = mongoose.model(
  "Inventory",
  InventorySchema,
  "Inventory"
);
