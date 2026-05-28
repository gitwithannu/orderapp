import mongoose, { Schema } from "mongoose";

const PermissionSchema = new Schema({
  role: { type: String, required: true, unique: true },
  permissions: { type: [String], required: true }
});

export default mongoose.models.Permission ||
  mongoose.model("Permission", PermissionSchema);
