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
      // required: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
    },
    price: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    productType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variants",
      required: true,
    },
    productTypeId: {
      type: String,
    },
    sold: {
      type: Number,
      required: true,
      default: 0,
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
    },
    variantValues: [
      {
        name: {
          type: String,
          required: true,
        },
        values: {
          purchasePrice: {
            type: String,
            required: true,
            default: "0",
          },
          price: {
            type: String,
            required: true,
          },
          discountedPrice: {
            type: String,
            required: true,
            default: "0",
          },
          discountPercent: Number,
          inStock: {
            type: Number,
            required: true,
          },
          sold: {
            type: Number,
            default: 0,
          },
          picture: [
            {
              type: String,
              required: true,
            },
          ],
        },
      },
    ],
    pictures: [
      {
        type: String,
        // required: true,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    AdditionalSpecification: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    ratingSum: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const calculateDiscount = (variant) => {
  const price = Number(variant.values.price);
  const discountedPrice = Number(variant.values.discountedPrice);
  let discountPercent = 0;
  if (price && discountedPrice && discountedPrice < price) {
    discountPercent = Math.round(((price - discountedPrice) / price) * 100);
  }
  return discountPercent;
};

productSchema.pre("save", function (next) {
  if (!this.isModified("variantValues")) return next();
  this.variantValues.forEach((variant) => {
    variant.values.discountPercent = calculateDiscount(variant);
  });
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const variantValues = update?.variantValues || update?.$set?.variantValues;

  if (variantValues) {
    variantValues.forEach((variant) => {
      variant.values.discountPercent = calculateDiscount(variant);
    });
    if (update.$set) {
      update.$set.variantValues = variantValues;
    } else {
      update.variantValues = variantValues;
    }
  }
  next();
});

export const Products = mongoose.model("Products", productSchema, "Products");
