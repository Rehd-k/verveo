import mongoose from 'mongoose';

const retailerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    venueType: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      default: 'Abuja',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending',
      index: true,
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

retailerSchema.index({ city: 1, venueType: 1 });

export const Retailer = mongoose.models.Retailer || mongoose.model('Retailer', retailerSchema);
