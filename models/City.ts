import mongoose, { Schema } from "mongoose";

const CitySchema = new Schema({
  state: String,
  cities: [String]
});

export default mongoose.models.City || mongoose.model("City", CitySchema);
