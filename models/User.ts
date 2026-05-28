import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true }, // hashed password

    role: {
      type: String,
      enum: ["agent", "admin", "market", "superadmin"],
      default: "agent",
    },

    permissions: { type: [String], default: [] },

    marketId: { type: String, default: null }, // only for market managers

    assignedStores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        default: [],
      },
    ],
    
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
