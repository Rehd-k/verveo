import dbConnect from '@/lib/mongodb';
import { PlatformSettings } from '@/models/PlatformSettings';

const DEFAULT_SETTINGS = {
  productPricing: {
    cup: 400,
    box: 450,
    bag: 400,
    'pizza-box': 450,
  },
  defaultWalletCredit: 0,
  maintenanceMode: false,
};

export async function getPlatformSettings() {
  await dbConnect();
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create(DEFAULT_SETTINGS);
  }
  return settings;
}

export async function updatePlatformSettings(updates: Partial<typeof DEFAULT_SETTINGS>) {
  await dbConnect();
  const settings = await PlatformSettings.findOneAndUpdate(
    {},
    { $set: updates },
    { new: true, upsert: true }
  );
  return settings;
}
