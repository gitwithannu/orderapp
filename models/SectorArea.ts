import mongoose, { Schema } from "mongoose";

const SectorAreaSchema = new Schema({
  city: String,
  sectors: [String]
});

export default mongoose.models.SectorArea || mongoose.model("SectorArea", SectorAreaSchema, "sector_area");
