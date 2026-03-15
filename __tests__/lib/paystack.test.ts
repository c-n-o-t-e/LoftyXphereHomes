import { verifyWebhookSignature, verifyTransaction } from '@/lib/paystack'
import crypto from 'crypto'

describe('verifyWebhookSignature', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv, PAYSTACK_SECRET_KEY: 'sk_test_abc123' }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns false when PAYSTACK_SECRET_KEY is missing', () => {
    delete process.env.PAYSTACK_SECRET_KEY
    expect(verifyWebhookSignature('payload', 'sig')).toBe(false)
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc123'
  })

  it('returns true when signature matches HMAC-SHA512 of payload', () => {
    const payload = '{"event":"charge.success"}'
    const signature = crypto
      .createHmac('sha512', 'sk_test_abc123')
      .update(payload)
      .digest('hex')
    expect(verifyWebhookSignature(payload, signature)).toBe(true)
  })

  it('returns false when signature does not match', () => {
    const payload = '{"event":"charge.success"}'
    expect(verifyWebhookSignature(payload, 'wrong_signature')).toBe(false)
  })

  it('returns false when payload differs', () => {
    const payload = '{"event":"charge.success"}'
    const signature = crypto
      .createHmac('sha512', 'sk_test_abc123')
      .update(payload)
      .digest('hex')
    expect(verifyWebhookSignature('different_payload', signature)).toBe(false)
  })
})

describe('verifyTransaction', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, PAYSTACK_SECRET_KEY: 'sk_test_abc123' }
    global.fetch = jest.fn()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns null when PAYSTACK_SECRET_KEY is missing', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const result = await verifyTransaction('ref_123')
    expect(result).toBeNull()
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc123'
  })

  it('fetches Paystack verify URL with reference and Bearer token', async () => {
    const mockJson = { status: true, data: { status: 'success', reference: 'ref_123', amount: 100000 } }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockJson })

    await verifyTransaction('ref_123')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('ref_123'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer sk_test_abc123' },
      })
    )
  })

  it('returns parsed JSON response', async () => {
    const mockJson = { status: true, data: { status: 'success', reference: 'ref_123', amount: 100000 } }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockJson })

    const result = await verifyTransaction('ref_123')

    expect(result).toEqual(mockJson)
  })
})
