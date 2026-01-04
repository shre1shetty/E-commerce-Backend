import mongoose from "mongoose";

const EmailLogSchema = mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId },
    vendorId: { type: String },
    to: { type: String },
    fromEmail: { type: String },
    fromName: { type: String },
    replyTo: { type: String },
    subject: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EmailLog = mongoose.model("EmailLog", EmailLogSchema);
