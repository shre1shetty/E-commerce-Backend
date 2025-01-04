import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    variantFields: [
      {
        field: {
          type: String,
          required: true,
        },
        value: [
          {
            type: String,
            required: true,
          },
        ],
        flag: {
          type: String,
          required: true,
        },
      },
    ],
    Title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
    inStock: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      required: true,
    },
    category: [
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
    ],
    fabric: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    fitType: {
      type: String,
      required: true,
    },
    variantValues: [
      {
        name: {
          type: String,
          required: true,
        },
        values: {
          price: {
            type: String,
            required: true,
          },
          inStock: {
            type: Number,
            required: true,
          },
          picture: {
            type: String,
            // required: true,
          },
        },
      },
    ],
    pictures: [
      {
        type: String,
        // required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Products = mongoose.model("Products", productSchema, "Products");
