import { User } from '@/models/User';
import { creditWallet, debitWallet } from '@/lib/wallet/ledger';

/**
 * Move any remaining designCredit into walletBalance (idempotent per user).
 * Called on login / session hydrate so existing accounts converge to one balance.
 */
export async function migrateDesignCreditToWallet(userId: string): Promise<{
  migrated: number;
  walletBalance: number;
  designCredit: number;
}> {
  const user = await User.findById(userId).select('walletBalance designCredit');
  if (!user) {
    throw new Error('User not found');
  }

  const designCredit = Number(user.designCredit ?? 0);
  if (designCredit <= 0) {
    return {
      migrated: 0,
      walletBalance: Number(user.walletBalance ?? 0),
      designCredit: 0,
    };
  }

  // Debit design to zero via ledger, then credit wallet — stable references
  await debitWallet({
    userId,
    amount: designCredit,
    type: 'admin_adjustment',
    reference: `migrate_design_out_${userId}`,
    account: 'design',
    metadata: { reason: 'merge_design_into_wallet' },
  });

  await creditWallet({
    userId,
    amount: designCredit,
    type: 'admin_adjustment',
    reference: `migrate_design_in_${userId}`,
    account: 'wallet',
    metadata: { reason: 'merge_design_into_wallet', fromDesign: designCredit },
  });

  const refreshed = await User.findById(userId).select('walletBalance designCredit');
  return {
    migrated: designCredit,
    walletBalance: Number(refreshed?.walletBalance ?? 0),
    designCredit: Number(refreshed?.designCredit ?? 0),
  };
}
