import mongoose from 'mongoose';

const retailerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    venueType: {
      type: String,
      required: true,
    },
    address: String,
    location: {
      lat: Number,
      lng: Number,
    },
    allowance: {
      type: Number,
      default: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Retailer = mongoose.models.Retailer || mongoose.model('Retailer', retailerSchema);
