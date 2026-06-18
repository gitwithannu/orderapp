import mongoose, { Schema, Document, model, models, Model } from 'mongoose';

export interface IStoreVisitLog extends Document {
  agentId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  reasonCode: 'OVERSTOCKED' | 'PRICE_DISAGREEMENT' | 'OWNER_ABSENT' | 'SHOWING_INTEREST' | 'OWNER_BUSY' | 'NOT_SHOWING_INTEREST' | 'COMPETITOR_SWITCHED' | 'TEMPORARILY_CLOSED' | 'OTHER';
  agentNotes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreVisitLogSchema = new Schema<IStoreVisitLog>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    reasonCode: {
      type: String,
      enum: ['OVERSTOCKED', 'PRICE_DISAGREEMENT', 'OWNER_ABSENT', 'SHOWING_INTEREST', 'OWNER_BUSY', 'NOT_SHOWING_INTEREST', 'COMPETITOR_SWITCHED', 'TEMPORARILY_CLOSED', 'OTHER'],
      required: true,
    },
    agentNotes: { type: String, required: false },
    location: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    },
    isVerified: { type: Boolean, default: false },
  },
  { 
    timestamps: true 
  }
);

// High priority indexes for optimization
StoreVisitLogSchema.index({ agentId: 1 });
StoreVisitLogSchema.index({ storeId: 1 });
StoreVisitLogSchema.index({ createdAt: -1 });

// Explicitly type the model to satisfy TypeScript during Next.js hot-reloads
const StoreVisitLog = (models.StoreVisitLog as Model<IStoreVisitLog>) || model<IStoreVisitLog>('StoreVisitLog', StoreVisitLogSchema);

export default StoreVisitLog;