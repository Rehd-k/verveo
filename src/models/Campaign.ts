import mongoose from 'mongoose';

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
      text: String,
      colors: [String],
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
    },
    stats: {
      scans: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
