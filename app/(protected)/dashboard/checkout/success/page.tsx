'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authHeaders } from '@/lib/fetchAuth';

export default function CheckoutSuccess() {
  const [reference, setReference] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'error' | null>(null);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (!params) return;
    setReference(params.get('reference'));
    setTransactionId(params.get('transaction_id'));
    setTxRef(params.get('tx_ref'));
    setOrderId(params.get('orderId'));
    setPaymentMethod(params.get('paymentMethod'));
  }, []);

  useEffect(() => {
    async function verify() {
      if (!orderId) return setStatus('error');

      const isFlutterwave = paymentMethod === 'flutterwave' || transactionId;
      if (isFlutterwave && !transactionId) return setStatus('error');
      if (!isFlutterwave && !reference) return setStatus('error');

      setStatus('pending');
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            orderId,
            reference,
            transaction_id: transactionId,
            tx_ref: txRef,
            paymentMethod: isFlutterwave ? 'flutterwave' : 'paystack',
          }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    }

    verify();
  }, [reference, transactionId, txRef, orderId, paymentMethod]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-foreground">Payment Result</h2>
      <div className="mt-4 max-w-lg">
        {status === 'pending' && <div className="text-muted-foreground">Verifying payment...</div>}
        {status === 'success' && (
          <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-6">
            <h3 className="font-bold text-foreground">Payment verified</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your campaign payment was successful and is now being processed.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              Go to dashboard
            </Link>
          </div>
        )}
        {status === 'failed' && (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6">
            <h3 className="font-bold text-foreground">Verification failed</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not verify your payment. If you were charged, contact support with your order ID.
            </p>
            <Link href="/settings" className="mt-4 inline-block text-sm text-primary hover:underline">
              View billing
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">Missing or invalid callback parameters.</p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
