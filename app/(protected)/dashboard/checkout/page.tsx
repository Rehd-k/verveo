'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/fetchAuth';
import { useAuth } from '@/store/authStore';

export default function CheckoutPage() {
  const { user } = useAuth();
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // avoid useSearchParams on server prerender
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

  const handlePay = async () => {
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
        }),
      });
      const data = await res.json();
      const url = data.paystack?.data?.authorization_url;
      if (url) window.location.href = url;
      else alert('Payment initialization failed');
    } catch (e) {
      console.error(e);
      alert('Payment error');
    } finally {
      setLoading(false);
    }
  };

  if (!campaignId) return <div className="p-8 text-white">Missing campaignId</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white">Checkout</h2>
      {campaign ? (
        <div className="mt-4 rounded-lg border border-white/5 p-6 bg-white/3">
          <h3 className="font-bold text-white">{campaign.title}</h3>
          <p className="text-white/60">{campaign.quantity.toLocaleString()} units • {campaign.productType}</p>
          <p className="mt-4 font-bold text-white">Total: ₦{campaign.budget?.toLocaleString()}</p>
          <div className="mt-6">
            <button onClick={handlePay} disabled={loading} className="rounded-full bg-primary px-6 py-3 font-bold text-black">
              {loading ? 'Initializing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-white/60">Loading campaign...</div>
      )}
    </div>
  );
}
