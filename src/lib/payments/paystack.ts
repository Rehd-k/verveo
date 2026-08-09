import axios from 'axios';
import type { InitializeParams, InitializeResult, VerifyParams, VerifyResult } from './types';

function getSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('Paystack not configured');
  return secret;
}

export async function initializePaystack(params: InitializeParams): Promise<InitializeResult> {
  const secret = getSecret();
  const metadata: Record<string, string> = {};
  if (params.orderId) metadata.orderId = params.orderId;
  if (params.depositId) metadata.depositId = params.depositId;

  const res = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      amount: Math.round(params.amount) * 100,
      email: params.email,
      callback_url: params.callbackUrl,
      metadata,
    },
    { headers: { Authorization: `Bearer ${secret}` } }
  );

  const data = res.data;
  if (!data.status || !data.data?.authorization_url) {
    throw new Error(data.message || 'Paystack initialization failed');
  }

  return {
    redirectUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export async function verifyPaystack(params: VerifyParams): Promise<VerifyResult> {
  if (!params.reference) {
    return { success: false };
  }

  const secret = getSecret();
  const res = await axios.get(`https://api.paystack.co/transaction/verify/${params.reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  const { data } = res.data;
  const success = res.data.status && data?.status === 'success';
  // Paystack amounts are in kobo
  const amountPaid =
    typeof data?.amount === 'number' ? data.amount / 100 : undefined;

  return {
    success,
    amountPaid,
    transactionId: params.reference,
    raw: res.data,
  };
}
