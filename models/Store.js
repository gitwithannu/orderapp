import mongoose, { Schema } from "mongoose";

const StoreSchema = new Schema({
  storeName: String,
  ownerName: String,
  ownerMobile: String,
  state: String,
  city: String,
  sector: String,
  address: String,
  landmark: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Store ||
  mongoose.model("Store", StoreSchema, "stores");
