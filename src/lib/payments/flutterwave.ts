import axios from 'axios';
import type { InitializeParams, InitializeResult, VerifyParams, VerifyResult } from './types';

function getSecret() {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) throw new Error('Flutterwave not configured');
  return secret;
}

export async function initializeFlutterwave(params: InitializeParams): Promise<InitializeResult> {
  const secret = getSecret();
  const txRef = `verveo_${params.orderId}_${Date.now()}`;

  const res = await axios.post(
    'https://api.flutterwave.com/v3/payments',
    {
      tx_ref: txRef,
      amount: params.amount,
      currency: 'NGN',
      redirect_url: params.callbackUrl,
      customer: { email: params.email },
      meta: { orderId: params.orderId },
    },
    { headers: { Authorization: `Bearer ${secret}` } }
  );

  const data = res.data;
  if (data.status !== 'success' || !data.data?.link) {
    throw new Error(data.message || 'Flutterwave initialization failed');
  }

  return {
    redirectUrl: data.data.link,
    reference: txRef,
  };
}

export async function verifyFlutterwave(params: VerifyParams): Promise<VerifyResult> {
  const id = params.transactionId;
  if (!id) {
    return { success: false };
  }

  const secret = getSecret();
  const res = await axios.get(`https://api.flutterwave.com/v3/transactions/${id}/verify`, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  const data = res.data?.data;
  const success =
    res.data?.status === 'success' &&
    data?.status === 'successful' &&
    (!params.txRef || data.tx_ref === params.txRef);

  return {
    success,
    transactionId: String(id),
    raw: res.data,
  };
}

export function verifyFlutterwaveWebhookHash(hash: string | null): boolean {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secret || !hash) return false;
  return hash === secret;
}
