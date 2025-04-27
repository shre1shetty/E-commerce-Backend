import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { _id: false } // Disables `_id` generation for subdocuments
);
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
    price: {
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
    },
    sold: {
      type: Number,
      default: 0,
      set: (value) => (value == null ? 0 : value),
    },
    category: [categorySchema],
    fabric: {
      type: String,
    },
    brand: {
      type: String,
    },
    variantFields: [
      {
        field: { type: String, required: true },
        value: [{ type: String, required: true }],
        flag: { type: String, required: true },
      },
    ],
    fitType: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model(
  "Inventory",
  InventorySchema,
  "Inventory"
);
