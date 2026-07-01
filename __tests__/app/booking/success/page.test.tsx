import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import {
  BookingDateConflictError,
  confirmBookingFromPayment,
  getBookingByReference,
} from '@/lib/booking'
import * as payments from '@/lib/payments'
import * as alerts from '@/lib/email/admin-alerts'
import {
  enqueuePostBookingJobs,
  flushPostBookingJobsForBooking,
} from '@/lib/ops/bookingJobs'
import BookingSuccessPage from '@/app/booking/success/page'
import type { VerifiedPayment } from '@/lib/payments/types'

jest.mock('next/server', () => ({
  after: jest.fn((fn: () => void | Promise<void>) => {
    if (typeof fn === 'function') fn();
  }),
}))

const mockVerifyPayment = jest.fn()

jest.mock('@/lib/payments', () => ({
  getPaymentProvider: jest.fn(() => ({
    verifyPayment: mockVerifyPayment,
  })),
}))

jest.mock('@/lib/booking', () => {
  const actual = jest.requireActual('@/lib/booking')
  return {
    ...actual,
    confirmBookingFromPayment: jest.fn(),
    getBookingByReference: jest.fn(),
  }
})

jest.mock('@/lib/email/admin-alerts', () => ({
  sendAdminAlertBookingPersistenceFailed: jest.fn(),
}))

jest.mock('@/lib/ops/bookingJobs', () => ({
  enqueuePostBookingJobs: jest.fn().mockResolvedValue(undefined),
  flushPostBookingJobsForBooking: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

const verifiedPayment: VerifiedPayment = {
  reference: 'ref_123',
  provider: 'paystack',
  status: 'success',
  amountMinor: 100_00,
  metadata: {
    apartment_id: 'horizon-suite',
    check_in: '2026-03-20',
    check_out: '2026-03-24',
  },
  customerEmail: 'guest@example.com',
}

async function renderSuccessPage(searchParams: { reference?: string; provider?: string } = {}) {
  const searchParamsPromise = Promise.resolve(searchParams)
  const element = await BookingSuccessPage({ searchParams: searchParamsPromise })
  return render(element)
}

describe('Booking Success Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(getBookingByReference).mockResolvedValue(null)
  })

  it('renders failure state when no reference is provided', async () => {
    await renderSuccessPage()
    expect(
      screen.getByRole('heading', { name: /we couldn’t confirm your booking/i })
    ).toBeInTheDocument()
  })

  it('renders confirmed state when payment verifies successfully', async () => {
    mockVerifyPayment.mockResolvedValueOnce(verifiedPayment)
    jest.mocked(confirmBookingFromPayment).mockResolvedValueOnce({
      id: 'booking_success_1',
    } as never)

    await renderSuccessPage({ reference: 'ref_123' })
    expect(
      screen.getByRole('heading', { name: /your stay is confirmed/i })
    ).toBeInTheDocument()
    expect(confirmBookingFromPayment).toHaveBeenCalledWith(verifiedPayment)
    expect(jest.mocked(enqueuePostBookingJobs)).toHaveBeenCalledWith(
      'booking_success_1',
    )
    expect(jest.mocked(flushPostBookingJobsForBooking)).toHaveBeenCalledWith(
      'booking_success_1',
    )
  })

  it('renders login prompt for booking details', async () => {
    await renderSuccessPage()
    expect(screen.getByText(/log in with the email you used for this reservation/i)).toBeInTheDocument()
  })

  it('renders Access My Dashboard link', async () => {
    await renderSuccessPage()
    const link = screen.getByRole('link', { name: /access my dashboard/i })
    expect(link).toHaveAttribute('href', '/login?redirect=/my-bookings')
  })

  it('renders Browse more apartments link', async () => {
    await renderSuccessPage()
    const link = screen.getByRole('link', { name: /browse more apartments/i })
    expect(link).toHaveAttribute('href', '/apartments')
  })

  it('calls provider verifyPayment when reference is provided', async () => {
    mockVerifyPayment.mockResolvedValueOnce(verifiedPayment)
    jest.mocked(confirmBookingFromPayment).mockResolvedValueOnce({
      id: 'booking_success_1',
    } as never)
    await renderSuccessPage({ reference: 'ref_123' })
    expect(mockVerifyPayment).toHaveBeenCalledWith('ref_123')
    expect(jest.mocked(payments.getPaymentProvider)).toHaveBeenCalledWith('paystack')
  })

  it('uses flutterwave provider when booking record says FLUTTERWAVE', async () => {
    jest.mocked(getBookingByReference).mockResolvedValueOnce({
      reference: 'ref_fw',
      paymentProvider: 'FLUTTERWAVE',
      status: 'PENDING',
    })
    mockVerifyPayment.mockResolvedValueOnce({
      ...verifiedPayment,
      reference: 'ref_fw',
      provider: 'flutterwave',
    })
    jest.mocked(confirmBookingFromPayment).mockResolvedValueOnce({
      id: 'booking_fw_1',
    } as never)

    await renderSuccessPage({ reference: 'ref_fw' })
    expect(jest.mocked(payments.getPaymentProvider)).toHaveBeenCalledWith('flutterwave')
  })

  it('does not call verifyPayment when reference is empty', async () => {
    await renderSuccessPage({})
    await renderSuccessPage({ reference: '' })
    expect(mockVerifyPayment).not.toHaveBeenCalled()
  })

  it('attempts to persist the booking on the success page after verification success', async () => {
    mockVerifyPayment.mockResolvedValueOnce(verifiedPayment)
    jest.mocked(confirmBookingFromPayment).mockResolvedValueOnce({
      id: 'booking_success_1',
    } as never)

    await renderSuccessPage({ reference: 'ref_123' })
    expect(screen.getByRole('heading', { name: /your stay is confirmed/i })).toBeInTheDocument()
    expect(confirmBookingFromPayment).toHaveBeenCalled()
  })

  it('shows refund messaging when dates conflict after payment', async () => {
    mockVerifyPayment.mockResolvedValueOnce(verifiedPayment)
    jest.mocked(confirmBookingFromPayment).mockRejectedValueOnce(
      new BookingDateConflictError('Dates unavailable', { refundInitiated: true }),
    )

    await renderSuccessPage({ reference: 'ref_conflict' })

    expect(
      screen.getByRole('heading', { name: /those dates are no longer available/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/refund has been initiated/i).length).toBeGreaterThan(0)
  })

  it('sends admin alert if persistence fails but still shows confirmed state', async () => {
    const sendAdminAlertBookingPersistenceFailed = jest.mocked(alerts.sendAdminAlertBookingPersistenceFailed)

    mockVerifyPayment.mockResolvedValueOnce(verifiedPayment)
    jest.mocked(confirmBookingFromPayment).mockRejectedValueOnce(new Error('db down'))
    sendAdminAlertBookingPersistenceFailed.mockResolvedValueOnce(undefined)

    await renderSuccessPage({ reference: 'ref_123' })

    expect(screen.getByRole('heading', { name: /your stay is confirmed/i })).toBeInTheDocument()
    expect(sendAdminAlertBookingPersistenceFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: 'ref_123',
        verifiedPayment,
        paymentProvider: 'paystack',
      })
    )
  })
})
