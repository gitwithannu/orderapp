import mongoose, { Schema } from "mongoose";

const StateSchema = new Schema({
  id: Number,
  name: String
});

export default mongoose.models.State || mongoose.model("State", StateSchema);
