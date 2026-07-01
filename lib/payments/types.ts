export type PaymentProviderId = "paystack" | "flutterwave";

export interface PaymentMetadata {
  apartment_id: string;
  check_in: string;
  check_out: string;
  booker_name?: string;
  booker_phone?: string;
}

export interface VerifiedPayment {
  reference: string;
  provider: PaymentProviderId;
  status: "success" | "failed" | "abandoned";
  /** Amount in kobo (minor units). */
  amountMinor: number;
  metadata: PaymentMetadata;
  customerEmail?: string;
  /** Provider-specific transaction id (e.g. Flutterwave numeric id for refunds). */
  providerTransactionId?: string;
}

export interface InitializeCheckoutInput {
  email: string;
  name: string;
  phone: string;
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  reference: string;
  callbackUrl: string;
  amountNgn: number;
}

export interface InitializeCheckoutResult {
  authorizationUrl: string;
  reference: string;
  providerTransactionId?: string;
}

export interface RefundResult {
  ok: boolean;
  data?: unknown;
  message?: string;
}

export interface PaymentProviderAdapter {
  id: PaymentProviderId;
  initializeCheckout(input: InitializeCheckoutInput): Promise<InitializeCheckoutResult>;
  verifyPayment(reference: string): Promise<VerifiedPayment | null>;
  initiateRefund(args: {
    reference: string;
    amountMinor: number;
    providerTransactionId?: string | null;
  }): Promise<RefundResult>;
}
