/**
 * One-shot: move remaining designCredit balances into wallet for all users.
 * Safe to re-run (idempotent per user via ledger references).
 *
 * Usage: npx tsx scripts/migrate-design-credit.ts
 */
import dbConnect from '../src/lib/mongodb';
import { User } from '../src/models/User';
import { migrateDesignCreditToWallet } from '../src/lib/wallet/migrateDesignCredit';

async function main() {
  await dbConnect();
  const users = await User.find({ designCredit: { $gt: 0 } }).select('_id email designCredit');
  console.log(`Found ${users.length} user(s) with design credit`);

  for (const user of users) {
    const id = user._id.toString();
    const result = await migrateDesignCreditToWallet(id);
    console.log(`${user.email}: migrated ₦${result.migrated} → wallet ₦${result.walletBalance}`);
  }

  console.log('Done');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
