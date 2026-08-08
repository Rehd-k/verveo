import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    productPricing: {
      cup: { type: Number, default: 400 },
      box: { type: Number, default: 450 },
      bag: { type: Number, default: 400 },
      'pizza-box': { type: Number, default: 450 },
    },
    defaultWalletCredit: {
      type: Number,
      default: 0,
    },
    defaultDesignCredit: {
      type: Number,
      default: 150000,
    },
    bankAccountName: {
      type: String,
      default: '',
    },
    bankAccountNumber: {
      type: String,
      default: '',
    },
    bankName: {
      type: String,
      default: '',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const PlatformSettings =
  mongoose.models.PlatformSettings ||
  mongoose.model('PlatformSettings', platformSettingsSchema);
