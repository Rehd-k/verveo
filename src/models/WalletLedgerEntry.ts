import mongoose from 'mongoose';

const walletLedgerEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    account: {
      type: String,
      enum: ['wallet', 'design'],
      required: true,
      default: 'wallet',
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'deposit',
        'campaign_payment',
        'design_fee',
        'admin_adjustment',
        'signup_credit',
        'refund',
      ],
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedModel: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

walletLedgerEntrySchema.index({ reference: 1 }, { unique: true });
walletLedgerEntrySchema.index({ userId: 1, account: 1, createdAt: -1 });

export const WalletLedgerEntry =
  mongoose.models.WalletLedgerEntry ||
  mongoose.model('WalletLedgerEntry', walletLedgerEntrySchema);
