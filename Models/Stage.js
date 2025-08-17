import mongoose from "mongoose";

const StageSchema = mongoose.Schema(
  {
    stageName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rejectStage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Stage = mongoose.model(`Stage`, StageSchema, "Stages");
