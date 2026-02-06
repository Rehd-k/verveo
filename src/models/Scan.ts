import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    ip: String,
    userAgent: String,
    lat: Number,
    lng: Number,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);
