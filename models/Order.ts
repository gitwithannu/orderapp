import mongoose, { Schema, Document, models, model } from "mongoose";


export interface IOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  // Change 'store' and 'agent' from 'string' to 'any' or a specific object type
  store: {
    _id: string;
    storeName: string;
    city: string;
    state: string;
  } | any; 
  agent: {
    _id: string;
    name: string;
    email: string;
  } | any;
items: Array<{
    product: {
      _id: string;
      productName: string; // or 'name' depending on your Product schema
      price: number;
    } | any; 
    quantity: number;
    price: number;
  }>;
  status: string;
  totalAmount: number;
  notes?: string;      
  feedback?: string;   
  createdAt: string;
  
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },

    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },

    // ⭐ FIXED: Store must be ObjectId ref
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    // ⭐ FIXED: Agent must be ObjectId ref
    agent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // ⭐ FIXED: Items must match your frontend structure
    items: [
      {
        product: String,
        variantType: String,
        variantSize: String,
        quantity: Number,
        price: Number,
      },
    ],
      notes: {
        type: String,
        default: "",
      },

     
      feedback: {
        type: String,
        default: "",
      },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);
