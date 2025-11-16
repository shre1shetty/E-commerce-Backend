import mongoose from "mongoose";

const LayoutSchema = new mongoose.Schema(
  {
    layoutName: {
      type: String,
      required: true,
    },
    themeColor: {
      type: String,
    },
    logo: {
      type: String,
      required: true,
    },
    headerElement: {
      headerType: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        default: 100,
      },
      rows: [
        {
          file: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
    },
    subHeaderElement: {
      size: {
        type: Number,
        default: 100,
      },
      rows: [
        {
          file: {
            type: String,
            required: true,
          },
          size: {
            type: Number,
            default: 100,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
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
    topProduct: [
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
    footerDetails: {
      address: {
        type: String,
        required: true,
      },
      contact: {
        type: String,
        required: true,
      },
      instagram: {
        type: String,
        required: true,
      },
      facebook: {
        type: String,
        required: true,
      },
      youtube: {
        type: String,
        required: true,
      },
    },
    stickyPanel: {
      text: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

LayoutSchema.pre("findOneAndUpdate", function (next) {
  console.log(this.subHeaderElement);
  next();
});

export const Layout = mongoose.model("Layout", LayoutSchema, "Layout");
