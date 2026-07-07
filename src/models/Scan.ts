import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    ip: String,
    userAgent: String,
    visitorId: String,
    device: {
      type: { type: String },
      os: String,
      browser: String,
      model: String,
    },
    location: {
      lat: Number,
      lng: Number,
      city: String,
      region: String,
      country: String,
    },
    lat: Number,
    lng: Number,
    referrer: String,
    language: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

scanSchema.index({ campaignId: 1, createdAt: -1 });
scanSchema.index({ campaignId: 1, visitorId: 1 });

export const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);
