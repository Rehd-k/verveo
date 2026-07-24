'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { authHeaders } from '@/lib/fetchAuth';
import { useAuth } from '@/store/authStore';

type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer';

interface BankDetails {
  configured: boolean;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [proofNote, setProofNote] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const id = params ? params.get('campaignId') : null;
    setCampaignId(id);
  }, []);

  useEffect(() => {
    if (campaignId) {
      fetch(`/api/campaigns/${campaignId}`, { headers: authHeaders() })
        .then((r) => r.json())
        .then(setCampaign)
        .catch((e) => console.error(e));
    }
  }, [campaignId]);

  useEffect(() => {
    fetch('/api/payments/bank-details')
      .then((r) => r.json())
      .then(setBankDetails)
      .catch(() => setBankDetails({ configured: false }));
  }, []);

  const handleOnlinePay = async () => {
    if (!campaign) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          campaignId: campaign._id || campaign.id,
          amount: campaign.budget,
          email: user?.email || 'buyer@example.com',
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Payment initialization failed');
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Payment initialization failed');
      }
    } catch (e) {
      console.error(e);
      alert('Payment error');
    } finally {
      setLoading(false);
    }
  };

  const handleProofSubmit = async () => {
    if (!campaign || !proofFile) {
      alert('Please upload a payment proof file');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('campaignId', campaign._id || campaign.id);
      formData.append('amount', String(campaign.budget));
      formData.append('file', proofFile);
      if (proofNote.trim()) formData.append('note', proofNote.trim());

      const res = await fetch('/api/payments/proof', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit proof');
        return;
      }
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to submit proof');
    } finally {
      setLoading(false);
    }
  };

  if (!campaignId) return <div className="p-8 text-white">Missing campaignId</div>;

  if (submitted) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white">Proof Submitted</h2>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/3 p-6">
          <p className="text-white/80">
            Your payment proof has been submitted and is pending admin review. You will be notified once
            your payment is confirmed.
          </p>
          <Link
            href="/settings"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-black"
          >
            View billing status
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white">Checkout</h2>
      {campaign ? (
        <div className="mt-4 max-w-xl rounded-lg border border-white/5 bg-white/3 p-6">
          <h3 className="font-bold text-white">{campaign.title}</h3>
          <p className="text-white/60">
            {campaign.quantity.toLocaleString()} units • {campaign.productType}
          </p>
          <p className="mt-4 text-xl font-bold text-white">Total: ₦{campaign.budget?.toLocaleString()}</p>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-white/70">Payment method</p>
            {(['paystack', 'flutterwave', 'bank_transfer'] as PaymentMethod[]).map((method) => (
              <label
                key={method}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
                  paymentMethod === method ? 'border-primary bg-primary/10' : 'border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="accent-primary"
                />
                <span className="text-sm text-white">
                  {method === 'paystack' && 'Paystack (Card, Bank, USSD)'}
                  {method === 'flutterwave' && 'Flutterwave (Card, Bank, Mobile Money)'}
                  {method === 'bank_transfer' && 'Bank transfer (upload proof)'}
                </span>
              </label>
            ))}
          </div>

          {paymentMethod === 'bank_transfer' ? (
            <div className="mt-6 space-y-4">
              {bankDetails?.configured ? (
                <div className="rounded-lg border border-white/10 bg-background-dark/50 p-4 text-sm text-white/80">
                  <p className="font-semibold text-white">Transfer to:</p>
                  <p className="mt-2">Bank: {bankDetails.bankName}</p>
                  <p>Account name: {bankDetails.accountName}</p>
                  <p>Account number: {bankDetails.accountNumber}</p>
                  <p className="mt-2 font-medium text-primary">
                    Amount: ₦{campaign.budget?.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-amber-400">
                  Bank details are not configured. Contact support for transfer instructions.
                </p>
              )}

              <label className="block text-sm font-medium text-white/70">
                Transfer reference / note (optional)
                <input
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="e.g. TXN reference from your bank"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-white/70">Upload payment proof</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="mt-2 w-full text-sm text-white/70"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs text-white/50">JPG, PNG, WEBP, or PDF up to 5MB</p>
              </div>

              <button
                onClick={handleProofSubmit}
                disabled={loading || !proofFile}
                className="rounded-full bg-primary px-6 py-3 font-bold text-black disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit proof of payment'}
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <button
                onClick={handleOnlinePay}
                disabled={loading}
                className="rounded-full bg-primary px-6 py-3 font-bold text-black disabled:opacity-50"
              >
                {loading ? 'Initializing...' : `Pay with ${paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 text-white/60">Loading campaign...</div>
      )}
    </div>
  );
}
