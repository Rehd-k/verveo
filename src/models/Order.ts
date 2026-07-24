import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'flutterwave', 'bank_transfer'],
    },
    transactionId: String,
    proofImageUrl: String,
    proofNote: String,
    proofSubmittedAt: Date,
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
