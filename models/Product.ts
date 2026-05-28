import mongoose, { Schema } from "mongoose";

const VariantSchema = new Schema({
  type: { type: String, enum: ["Box", "Pouch"], required: true },
  size: { type: String, required: true }, // e.g., "50G", "100G", "200G", "10G"
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
});

const ProductSchema = new Schema({
    product_name: { type: String, required: true },
    variants: [VariantSchema], // ✅ multiple variants per product
    createdAt: { type: Date, default: Date.now },
}, 
{ timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
