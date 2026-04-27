import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import * as paystack from '@/lib/paystack'
import * as booking from '@/lib/booking'
import * as alerts from '@/lib/email/admin-alerts'
import BookingSuccessPage from '@/app/booking/success/page'

jest.mock('@/lib/paystack', () => ({
  verifyTransaction: jest.fn(),
}))

jest.mock('@/lib/booking', () => ({
  upsertBookingFromPaystack: jest.fn(),
}))

jest.mock('@/lib/email/admin-alerts', () => ({
  sendAdminAlertBookingPersistenceFailed: jest.fn(),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

async function renderSuccessPage(searchParams: { reference?: string } = {}) {
  const searchParamsPromise = Promise.resolve(searchParams)
  const element = await BookingSuccessPage({ searchParams: searchParamsPromise })
  return render(element)
}

describe('Booking Success Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders failure state when no reference is provided', async () => {
    await renderSuccessPage()
    expect(
      screen.getByRole('heading', { name: /we couldn’t confirm your booking/i })
    ).toBeInTheDocument()
  })

  it('renders confirmed state when payment verifies successfully', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    const upsertBookingFromPaystack = jest.mocked(booking.upsertBookingFromPaystack)
    verifyTransaction.mockResolvedValueOnce({
      status: true,
      data: { status: 'success', reference: 'ref_123', amount: 100_00 },
    })
    upsertBookingFromPaystack.mockResolvedValueOnce({} as never)

    await renderSuccessPage({ reference: 'ref_123' })
    expect(
      screen.getByRole('heading', { name: /your stay is confirmed/i })
    ).toBeInTheDocument()
    expect(upsertBookingFromPaystack).toHaveBeenCalled()
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

  it('calls verifyTransaction when reference is provided', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    const upsertBookingFromPaystack = jest.mocked(booking.upsertBookingFromPaystack)
    verifyTransaction.mockResolvedValueOnce({
      status: true,
      data: { status: 'success', reference: 'ref_123', amount: 100_00 },
    })
    upsertBookingFromPaystack.mockResolvedValueOnce({} as never)
    await renderSuccessPage({ reference: 'ref_123' })
    expect(verifyTransaction).toHaveBeenCalledWith('ref_123')
  })

  it('does not call verifyTransaction when reference is empty', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    await renderSuccessPage({})
    await renderSuccessPage({ reference: '' })
    expect(verifyTransaction).not.toHaveBeenCalled()
  })

  it('attempts to persist the booking on the success page after verification success', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    const upsertBookingFromPaystack = jest.mocked(booking.upsertBookingFromPaystack)
    verifyTransaction.mockResolvedValueOnce({
      status: true,
      data: { status: 'success', reference: 'ref_123', amount: 100_00 },
    })
    upsertBookingFromPaystack.mockResolvedValueOnce({} as never)

    await renderSuccessPage({ reference: 'ref_123' })
    expect(screen.getByRole('heading', { name: /your stay is confirmed/i })).toBeInTheDocument()
    expect(upsertBookingFromPaystack).toHaveBeenCalled()
  })

  it('sends admin alert if persistence fails but still shows confirmed state', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    const upsertBookingFromPaystack = jest.mocked(booking.upsertBookingFromPaystack)
    const sendAdminAlertBookingPersistenceFailed = jest.mocked(alerts.sendAdminAlertBookingPersistenceFailed)

    const paystackData = { status: 'success' as const, reference: 'ref_123', amount: 100_00 }
    verifyTransaction.mockResolvedValueOnce({
      status: true,
      data: paystackData,
    })
    upsertBookingFromPaystack.mockRejectedValueOnce(new Error('db down'))
    sendAdminAlertBookingPersistenceFailed.mockResolvedValueOnce(undefined)

    await renderSuccessPage({ reference: 'ref_123' })

    expect(screen.getByRole('heading', { name: /your stay is confirmed/i })).toBeInTheDocument()
    expect(sendAdminAlertBookingPersistenceFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: 'ref_123',
        paystackData,
      })
    )
  })
})
