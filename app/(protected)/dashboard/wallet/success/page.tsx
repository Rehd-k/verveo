'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authHeaders } from '@/lib/fetchAuth';
import { useAuth } from '@/store/authStore';

export default function WalletDepositSuccess() {
  const [reference, setReference] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'error' | null>(null);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (!params) return;
    setReference(params.get('reference'));
    setTransactionId(params.get('transaction_id'));
    setTxRef(params.get('tx_ref'));
    setDepositId(params.get('depositId'));
    setPaymentMethod(params.get('paymentMethod'));
  }, []);

  useEffect(() => {
    async function verify() {
      if (!depositId) return setStatus('error');

      const isFlutterwave = paymentMethod === 'flutterwave' || !!transactionId;
      if (isFlutterwave && !transactionId) return setStatus('error');
      if (!isFlutterwave && !reference) return setStatus('error');

      setStatus('pending');
      try {
        const res = await fetch('/api/wallet/deposits/verify', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            depositId,
            reference,
            transaction_id: transactionId,
            tx_ref: txRef,
            paymentMethod: isFlutterwave ? 'flutterwave' : 'paystack',
          }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus('success');
          const ledgerRes = await fetch('/api/wallet/ledger?account=wallet&limit=1', {
            headers: authHeaders(),
          });
          const ledgerData = await ledgerRes.json();
          if (ledgerRes.ok && typeof ledgerData.walletBalance === 'number') {
            const current = useAuth.getState().user;
            if (current) {
              useAuth.setState({ user: { ...current, walletBalance: ledgerData.walletBalance } });
            }
          }
        } else {
          setStatus('failed');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    }

    verify();
  }, [reference, transactionId, txRef, depositId, paymentMethod]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-foreground">Deposit Result</h2>
      <div className="mt-4 max-w-lg">
        {status === 'pending' && <div className="text-muted-foreground">Verifying deposit...</div>}
        {status === 'success' && (
          <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-6">
            <h3 className="font-bold text-foreground">Deposit verified</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your wallet has been credited. You can use the balance to pay for campaigns.
            </p>
            <Link
              href="/dashboard/wallet"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              Back to wallet
            </Link>
          </div>
        )}
        {status === 'failed' && (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6">
            <h3 className="font-bold text-foreground">Verification failed</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not verify your deposit. If you were charged, contact support with your
              deposit ID.
            </p>
            <Link href="/dashboard/wallet" className="mt-4 inline-block text-sm text-primary hover:underline">
              Back to wallet
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">Missing or invalid callback parameters.</p>
            <Link href="/dashboard/wallet" className="mt-4 inline-block text-sm text-primary hover:underline">
              Back to wallet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
