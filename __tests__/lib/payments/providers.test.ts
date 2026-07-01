jest.mock("@/lib/paystack", () => ({
  verifyTransaction: jest.fn(),
  initiateRefund: jest.fn(),
  verifyWebhookSignature: jest.fn(),
}));

jest.mock("@/lib/flutterwave", () => ({
  verifyTransactionByReference: jest.fn(),
  initiateRefund: jest.fn(),
  isFlutterwaveConfigured: jest.fn(() => Boolean(process.env.FLUTTERWAVE_SECRET_KEY?.trim())),
}));

import { verifyTransaction } from "@/lib/paystack";
import { verifyTransactionByReference } from "@/lib/flutterwave";
import { getAvailablePaymentProviders, getPaymentProvider } from "@/lib/payments";
import { totalNgnToKobo } from "@/lib/pricing";

describe("payment providers", () => {
  const originalPaystack = process.env.PAYSTACK_SECRET_KEY;
  const originalFlutterwave = process.env.FLUTTERWAVE_SECRET_KEY;

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalPaystack;
    process.env.FLUTTERWAVE_SECRET_KEY = originalFlutterwave;
    jest.clearAllMocks();
  });

  it("lists configured providers", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test";
    process.env.FLUTTERWAVE_SECRET_KEY = "flw_test";
    expect(getAvailablePaymentProviders()).toEqual(["paystack", "flutterwave"]);
  });

  it("paystack verifyPayment maps kobo amount to amountMinor", async () => {
    jest.mocked(verifyTransaction).mockResolvedValueOnce({
      status: true,
      data: {
        reference: "ref_1",
        status: "success",
        amount: 101_250_00,
        metadata: {
          apartment_id: "horizon-suite",
          check_in: "2026-05-01",
          check_out: "2026-05-03",
        },
        customer: { email: "a@b.com" },
      },
    });

    const verified = await getPaymentProvider("paystack").verifyPayment("ref_1");
    expect(verified?.amountMinor).toBe(101_250_00);
    expect(verified?.provider).toBe("paystack");
  });

  it("flutterwave verifyPayment normalizes NGN to kobo in amountMinor", async () => {
    jest.mocked(verifyTransactionByReference).mockResolvedValueOnce({
      status: "success",
      data: {
        id: 12345,
        tx_ref: "ref_fw",
        status: "successful",
        amount: 100_000,
        currency: "NGN",
        meta: {
          apartment_id: "horizon-suite",
          check_in: "2026-05-01",
          check_out: "2026-05-03",
        },
        customer: { email: "a@b.com" },
      },
    });

    const verified = await getPaymentProvider("flutterwave").verifyPayment("ref_fw");
    expect(verified?.amountMinor).toBe(totalNgnToKobo(100_000));
    expect(verified?.providerTransactionId).toBe("12345");
  });
});
