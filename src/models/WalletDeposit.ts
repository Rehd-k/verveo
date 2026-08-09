import mongoose from 'mongoose';

const walletDepositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
      required: true,
    },
    transactionId: String,
    proofImageUrl: String,
    proofNote: String,
    proofSubmittedAt: Date,
  },
  { timestamps: true }
);

walletDepositSchema.index({ userId: 1, createdAt: -1 });
walletDepositSchema.index({ status: 1, createdAt: -1 });

export const WalletDeposit =
  mongoose.models.WalletDeposit || mongoose.model('WalletDeposit', walletDepositSchema);
