export type OnlinePaymentMethod = 'paystack' | 'flutterwave';

export interface InitializeParams {
  amount: number;
  email: string;
  orderId: string;
  callbackUrl: string;
}

export interface InitializeResult {
  redirectUrl: string;
  reference?: string;
}

export interface VerifyParams {
  reference?: string;
  transactionId?: string;
  txRef?: string;
}

export interface VerifyResult {
  success: boolean;
  transactionId?: string;
  raw?: unknown;
}
