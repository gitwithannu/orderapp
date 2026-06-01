import mongoose, { Schema } from "mongoose";

const AssignedRegionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: restrict user to specific stores
    storeIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.AssignedRegions ||
  mongoose.model("AssignedRegions", AssignedRegionSchema);
