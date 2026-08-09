'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/authStore';
import { authHeaders } from '@/lib/fetchAuth';
import type { WalletLedgerEntry } from '@/types';

type DepositMethod = 'paystack' | 'flutterwave' | 'bank_transfer';

type BankDetails = {
  configured: boolean;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
};

export default function WalletPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<DepositMethod>('paystack');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<WalletLedgerEntry[]>([]);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance ?? 0);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNote, setProofNote] = useState('');
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLedger = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/ledger?account=wallet&limit=40', {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries || []);
        setWalletBalance(data.walletBalance ?? 0);
        if (typeof data.walletBalance === 'number') {
          const current = useAuth.getState().user;
          if (current) {
            useAuth.setState({ user: { ...current, walletBalance: data.walletBalance } });
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadLedger();
    fetch('/api/payments/bank-details', { headers: authHeaders() })
      .then((r) => r.json())
      .then(setBankDetails)
      .catch(() => setBankDetails({ configured: false }));
  }, [loadLedger]);

  const handleOnlineDeposit = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed < 100) {
      setMessage('Enter an amount of at least ₦100');
      return;
    }
    if (!user?.email) {
      setMessage('Missing email on account');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/wallet/deposits/initialize', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          amount: parsed,
          email: user.email,
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to start deposit');
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setMessage('No redirect URL returned');
    } catch {
      setMessage('Deposit initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBankProof = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed < 100) {
      setMessage('Enter an amount of at least ₦100');
      return;
    }
    if (!proofFile) {
      setMessage('Upload proof of payment');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', proofFile);
      form.append('amount', String(parsed));
      if (proofNote.trim()) form.append('note', proofNote.trim());

      const res = await fetch('/api/wallet/deposits/proof', {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to submit proof');
        return;
      }
      setProofSubmitted(true);
      setAmount('');
      setProofFile(null);
      setProofNote('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadLedger();
    } catch {
      setMessage('Failed to submit proof');
    } finally {
      setLoading(false);
    }
  };

  if (proofSubmitted) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-foreground">Proof submitted</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Your bank transfer proof is pending admin review. Your wallet will be credited once
          confirmed.
        </p>
        <button
          type="button"
          onClick={() => setProofSubmitted(false)}
          className="mt-6 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
        >
          Make another deposit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Wallet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposit funds and use your balance to pay for campaigns.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Business wallet</p>
        <p className="mt-2 text-3xl font-bold text-foreground">
          ₦{walletBalance.toLocaleString()}
        </p>
        <Link href="/settings" className="mt-3 inline-block text-sm text-primary hover:underline">
          View billing history
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Deposit</h3>
        <label className="mt-4 block text-sm text-muted-foreground">
          Amount (₦)
          <input
            type="number"
            min={100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            className="mt-2 w-full max-w-xs rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          {(['paystack', 'flutterwave', 'bank_transfer'] as DepositMethod[]).map((m) => (
            <label
              key={m}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm ${
                method === m
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              <input
                type="radio"
                name="depositMethod"
                className="sr-only"
                checked={method === m}
                onChange={() => setMethod(m)}
              />
              {m === 'bank_transfer' ? 'Bank transfer' : m === 'paystack' ? 'Paystack' : 'Flutterwave'}
            </label>
          ))}
        </div>

        {message && <p className="mt-3 text-sm text-amber-400">{message}</p>}

        {method === 'bank_transfer' ? (
          <div className="mt-6 space-y-4">
            {bankDetails?.configured ? (
              <div className="rounded-lg border border-border bg-background/50 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Transfer to:</p>
                <p className="mt-2">Bank: {bankDetails.bankName}</p>
                <p>Account name: {bankDetails.accountName}</p>
                <p>Account number: {bankDetails.accountNumber}</p>
              </div>
            ) : (
              <p className="text-sm text-amber-400">
                Bank details are not configured. Contact support for transfer instructions.
              </p>
            )}

            <label className="block text-sm font-medium text-muted-foreground">
              Transfer reference / note (optional)
              <input
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="e.g. TXN reference from your bank"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary/70"
              />
            </label>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Upload payment proof</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="mt-2 w-full text-sm text-muted-foreground"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP, or PDF up to 5MB</p>
            </div>

            <button
              type="button"
              onClick={handleBankProof}
              disabled={loading || !proofFile}
              className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit proof of payment'}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleOnlineDeposit}
              disabled={loading}
              className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              {loading
                ? 'Initializing...'
                : `Deposit with ${method === 'paystack' ? 'Paystack' : 'Flutterwave'}`}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Recent activity</h3>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No wallet movements yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{e.type.replace(/_/g, ' ')}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      e.amount >= 0 ? 'text-green-500' : 'text-foreground'
                    }`}
                  >
                    {e.amount >= 0 ? '+' : ''}₦{e.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bal ₦{e.balanceAfter.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
