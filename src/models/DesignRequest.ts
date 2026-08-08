import mongoose from 'mongoose';

const designRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    containerDescription: {
      type: String,
      required: true,
      trim: true,
    },
    preferredContact: {
      type: String,
      enum: ['video_call', 'whatsapp', 'email', 'phone'],
      required: true,
    },
    contactValue: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'completed', 'cancelled'],
      default: 'pending',
    },
    amountCharged: {
      type: Number,
      required: true,
      default: 150000,
    },
  },
  { timestamps: true }
);

export const DesignRequest =
  mongoose.models.DesignRequest || mongoose.model('DesignRequest', designRequestSchema);
