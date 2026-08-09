import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['draft', 'processing', 'printing', 'dispatched', 'live', 'completed'],
      required: true,
    },
    note: String,
    expectedAt: Date,
    trackingRef: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    locations: [String],
    venueTypes: [String],
    productType: {
      type: String,
      enum: ['cup', 'box', 'bag', 'pizza-box'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    design: {
      imageUrl: String,
      previewUrl: String,
      fileName: String,
      text: String,
      colors: [String],
      dpiChecked: Boolean,
      handoff: {
        type: String,
        enum: ['self', 'verveo_team'],
        default: 'self',
      },
    },
    qrCode: String,
    ctaUrl: String,
    budget: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'printing', 'dispatched', 'live', 'completed'],
      default: 'draft',
      index: true,
    },
    /** Ops note shown to advertiser on latest status */
    statusNote: String,
    /** Expected date for current stage (print finish / delivery / go-live) */
    expectedAt: Date,
    /** Courier / internal dispatch reference */
    trackingRef: String,
    statusHistory: [statusHistorySchema],
    stats: {
      scans: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, updatedAt: -1 });

export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
