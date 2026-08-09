import { WalletDeposit } from '@/models/WalletDeposit';
import { creditWallet } from '@/lib/wallet/ledger';

/**
 * Mark a wallet deposit paid and credit the user's wallet exactly once.
 * Credits first (idempotent on ledger reference `deposit_<id>`), then flips status.
 * Safe to call from verify + webhook + admin approval.
 */
export async function markDepositPaid(depositId: string, transactionId?: string) {
  const deposit = await WalletDeposit.findById(depositId);
  if (!deposit) return null;

  if (deposit.status === 'failed') {
    return deposit;
  }

  // Stable per-deposit reference so verify + webhook + admin cannot double-credit
  const reference = `deposit_${depositId}`;

  if (deposit.status === 'pending' || deposit.status === 'paid') {
    await creditWallet({
      userId: deposit.userId.toString(),
      amount: deposit.amount,
      type: 'deposit',
      reference,
      account: 'wallet',
      relatedId: deposit._id.toString(),
      relatedModel: 'WalletDeposit',
      metadata: {
        paymentMethod: deposit.paymentMethod,
        transactionId: transactionId || deposit.transactionId,
      },
    });
  }

  if (deposit.status === 'paid') {
    if (transactionId && !deposit.transactionId) {
      deposit.transactionId = transactionId;
      await deposit.save();
    }
    return deposit;
  }

  const updated = await WalletDeposit.findOneAndUpdate(
    { _id: depositId, status: 'pending' },
    {
      status: 'paid',
      ...(transactionId ? { transactionId } : {}),
    },
    { new: true }
  );

  return updated || WalletDeposit.findById(depositId);
}
