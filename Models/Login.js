import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    loginRole: {
      type: String,
    },
    redirectTo: {
      type: String,
    },
  },
  { timestamps: true }
);

export const UserSchema = mongoose.model(
  "Credentials",
  userRoleSchema,
  "Credentials"
);
