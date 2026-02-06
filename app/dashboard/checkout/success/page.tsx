'use client';

import { useEffect, useState } from 'react';

export default function CheckoutSuccess() {
  const [reference, setReference] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending'|'success'|'failed'|'error'|null>(null);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    setReference(params ? params.get('reference') : null);
    setOrderId(params ? params.get('orderId') : null);
  }, []);

  useEffect(() => {
    async function verify() {
      if (!reference || !orderId) return setStatus('error');
      setStatus('pending');
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, orderId }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus('success');
          setDetail(data.data);
        } else {
          setStatus('failed');
          setDetail(data.data || data);
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    }

    verify();
  }, [reference, orderId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white">Payment Result</h2>
      <div className="mt-4">
        {status === 'pending' && <div className="text-white/70">Verifying payment...</div>}
        {status === 'success' && (
          <div className="rounded-lg p-6 bg-white/3">
            <h3 className="font-bold text-white">Payment Verified ✅</h3>
            <pre className="text-xs text-white/70 mt-2">{JSON.stringify(detail, null, 2)}</pre>
          </div>
        )}
        {status === 'failed' && (
          <div className="rounded-lg p-6 bg-red-800/30">
            <h3 className="font-bold text-white">Verification failed</h3>
            <pre className="text-xs text-white/70 mt-2">{JSON.stringify(detail, null, 2)}</pre>
          </div>
        )}
        {status === 'error' && <div className="text-white/70">Missing or invalid callback parameters.</div>}
      </div>
    </div>
  );
}
