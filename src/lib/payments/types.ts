export type OnlinePaymentMethod = 'paystack' | 'flutterwave';

export interface InitializeParams {
  amount: number;
  email: string;
  /** Campaign checkout order id */
  orderId?: string;
  /** Wallet deposit id */
  depositId?: string;
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
  /** Amount paid in NGN (major units), when available from the gateway */
  amountPaid?: number;
  transactionId?: string;
  raw?: unknown;
}
