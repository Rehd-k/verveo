import mongoose from 'mongoose';

const stockOrderSchema = new mongoose.Schema(
  {
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending',
      index: true,
    },
    notes: String,
    fulfilledAt: Date,
  },
  { timestamps: true }
);

export const StockOrder =
  mongoose.models.StockOrder || mongoose.model('StockOrder', stockOrderSchema);
