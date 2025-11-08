import mongoose from "mongoose";

const workFlowHistory = mongoose.Schema(
  {
    workFlowStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkFlowDefination",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders",
      required: true,
    },
  },
  { timestamps: true }
);

export const WorkFlowModal = mongoose.model(
  "WorkFlowHistory",
  workFlowHistory,
  "WorkFlowHistory"
);
