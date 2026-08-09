import mongoose from 'mongoose';
import { User } from '@/models/User';
import { WalletLedgerEntry } from '@/models/WalletLedgerEntry';

export type WalletAccount = 'wallet' | 'design';

export type LedgerEntryType =
  | 'deposit'
  | 'campaign_payment'
  | 'design_fee'
  | 'admin_adjustment'
  | 'signup_credit'
  | 'refund';

export class InsufficientBalanceError extends Error {
  balance: number;
  required: number;
  account: WalletAccount;

  constructor(account: WalletAccount, balance: number, required: number) {
    super(`Insufficient ${account} balance`);
    this.name = 'InsufficientBalanceError';
    this.account = account;
    this.balance = balance;
    this.required = required;
  }
}

export class DuplicateLedgerReferenceError extends Error {
  entry: LedgerResult;

  constructor(entry: LedgerResult) {
    super('Ledger reference already exists');
    this.name = 'DuplicateLedgerReferenceError';
    this.entry = entry;
  }
}

type BalanceField = 'walletBalance' | 'designCredit';

function balanceField(account: WalletAccount): BalanceField {
  return account === 'design' ? 'designCredit' : 'walletBalance';
}

export interface LedgerMutationParams {
  userId: string;
  amount: number;
  type: LedgerEntryType;
  reference: string;
  account?: WalletAccount;
  relatedId?: string;
  relatedModel?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}

export interface LedgerResult {
  entryId: string;
  userId: string;
  account: WalletAccount;
  amount: number;
  balanceAfter: number;
  type: LedgerEntryType;
  reference: string;
  alreadyApplied: boolean;
}

function serializeEntry(
  entry: {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    account: WalletAccount;
    amount: number;
    balanceAfter: number;
    type: LedgerEntryType;
    reference: string;
  },
  alreadyApplied: boolean
): LedgerResult {
  return {
    entryId: entry._id.toString(),
    userId: entry.userId.toString(),
    account: entry.account,
    amount: entry.amount,
    balanceAfter: entry.balanceAfter,
    type: entry.type,
    reference: entry.reference,
    alreadyApplied,
  };
}

async function findExistingByReference(reference: string): Promise<LedgerResult | null> {
  const existing = await WalletLedgerEntry.findOne({ reference }).lean();
  if (!existing) return null;
  return serializeEntry(existing as Parameters<typeof serializeEntry>[0], true);
}

/**
 * Credit (increase) wallet or design balance. Idempotent on `reference`.
 */
export async function creditWallet(params: LedgerMutationParams): Promise<LedgerResult> {
  const amount = Number(params.amount);
  if (!amount || amount <= 0) {
    throw new Error('Credit amount must be positive');
  }
  if (!params.reference?.trim()) {
    throw new Error('Ledger reference is required');
  }

  const account = params.account ?? 'wallet';
  const field = balanceField(account);

  const existing = await findExistingByReference(params.reference);
  if (existing) return existing;

  const user = await User.findByIdAndUpdate(
    params.userId,
    { $inc: { [field]: amount } },
    { new: true }
  ).select(field);

  if (!user) {
    throw new Error('User not found');
  }

  const balanceAfter = Number(user[field] ?? 0);

  try {
    const entry = await WalletLedgerEntry.create({
      userId: params.userId,
      account,
      amount,
      balanceAfter,
      type: params.type,
      reference: params.reference,
      relatedId: params.relatedId,
      relatedModel: params.relatedModel,
      metadata: params.metadata,
      createdBy: params.createdBy,
    });

    return serializeEntry(entry, false);
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err ? (err as { code?: number }).code : undefined;

    if (code === 11000) {
      // Race: another credit won; roll back our increment and return existing
      await User.findByIdAndUpdate(params.userId, { $inc: { [field]: -amount } });
      const raced = await findExistingByReference(params.reference);
      if (raced) return raced;
    }

    // Compensating rollback if ledger insert failed for another reason
    await User.findByIdAndUpdate(params.userId, { $inc: { [field]: -amount } });
    throw err;
  }
}

/**
 * Debit (decrease) wallet or design balance. Idempotent on `reference`.
 * Uses conditional $gte so concurrent spends cannot overdraw.
 */
export async function debitWallet(params: LedgerMutationParams): Promise<LedgerResult> {
  const amount = Number(params.amount);
  if (!amount || amount <= 0) {
    throw new Error('Debit amount must be positive');
  }
  if (!params.reference?.trim()) {
    throw new Error('Ledger reference is required');
  }

  const account = params.account ?? 'wallet';
  const field = balanceField(account);
  const signedAmount = -amount;

  const existing = await findExistingByReference(params.reference);
  if (existing) return existing;

  const user = await User.findOneAndUpdate(
    {
      _id: params.userId,
      [field]: { $gte: amount },
    },
    { $inc: { [field]: signedAmount } },
    { new: true }
  ).select(field);

  if (!user) {
    const current = await User.findById(params.userId).select(field);
    if (!current) throw new Error('User not found');
    throw new InsufficientBalanceError(account, Number(current[field] ?? 0), amount);
  }

  const balanceAfter = Number(user[field] ?? 0);

  try {
    const entry = await WalletLedgerEntry.create({
      userId: params.userId,
      account,
      amount: signedAmount,
      balanceAfter,
      type: params.type,
      reference: params.reference,
      relatedId: params.relatedId,
      relatedModel: params.relatedModel,
      metadata: params.metadata,
      createdBy: params.createdBy,
    });

    return serializeEntry(entry, false);
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err ? (err as { code?: number }).code : undefined;

    if (code === 11000) {
      // Race: refund our debit and return the winning entry
      await User.findByIdAndUpdate(params.userId, { $inc: { [field]: amount } });
      const raced = await findExistingByReference(params.reference);
      if (raced) return raced;
    }

    // Fail closed: restore balance
    await User.findByIdAndUpdate(params.userId, { $inc: { [field]: amount } });
    throw err;
  }
}

/**
 * Set absolute balance by applying a delta credit/debit through the ledger.
 */
export async function setBalanceViaLedger(params: {
  userId: string;
  account: WalletAccount;
  targetBalance: number;
  reference: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}): Promise<LedgerResult | null> {
  if (params.targetBalance < 0) {
    throw new Error('Balance cannot be negative');
  }

  const field = balanceField(params.account);
  const user = await User.findById(params.userId).select(field);
  if (!user) throw new Error('User not found');

  const current = Number(user[field] ?? 0);
  const delta = params.targetBalance - current;
  if (delta === 0) return null;

  if (delta > 0) {
    return creditWallet({
      userId: params.userId,
      amount: delta,
      type: 'admin_adjustment',
      reference: params.reference,
      account: params.account,
      createdBy: params.createdBy,
      metadata: { ...params.metadata, previousBalance: current, targetBalance: params.targetBalance },
    });
  }

  return debitWallet({
    userId: params.userId,
    amount: Math.abs(delta),
    type: 'admin_adjustment',
    reference: params.reference,
    account: params.account,
    createdBy: params.createdBy,
    metadata: { ...params.metadata, previousBalance: current, targetBalance: params.targetBalance },
  });
}
