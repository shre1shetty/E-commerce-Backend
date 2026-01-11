import mongoose from "mongoose";

const workFlowDefinationSchema = mongoose.Schema(
  {
    stageFrom: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId("000000000000000000000000"),
      ref: "Stage",
    },
    stageTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stage",
      required: true,
    },
    stageName: {
      type: String,
      required: true,
    },
    firstStage: {
      type: Boolean,
      default: false,
    },
    finalStage: {
      type: Boolean,
      default: false,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const workFlowDefination = mongoose.model(
  "WorkFlowDefination",
  workFlowDefinationSchema,
  "WorkFlowDefinations"
);
