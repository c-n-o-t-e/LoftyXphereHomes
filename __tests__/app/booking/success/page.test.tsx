import { render, screen } from '@testing-library/react'
import * as paystack from '@/lib/paystack'
import BookingSuccessPage from '@/app/booking/success/page'
import { upsertBookingFromPaystack } from '@/lib/booking'

jest.mock('@/lib/paystack', () => ({
  verifyTransaction: jest.fn(),
}))

jest.mock('@/lib/booking', () => ({
  upsertBookingFromPaystack: jest.fn(),
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

  it('renders confirmed state when payment verifies and persistence succeeds', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    verifyTransaction.mockResolvedValueOnce({
      status: true,
      data: { status: 'success' },
    })
    ;(upsertBookingFromPaystack as jest.Mock).mockResolvedValueOnce({})

    await renderSuccessPage({ reference: 'ref_123' })
    expect(
      screen.getByRole('heading', { name: /your stay is confirmed/i })
    ).toBeInTheDocument()
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
    verifyTransaction.mockResolvedValueOnce({ status: true, data: { status: 'success' } })
    await renderSuccessPage({ reference: 'ref_123' })
    expect(verifyTransaction).toHaveBeenCalledWith('ref_123')
  })

  it('does not call verifyTransaction when reference is empty', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    await renderSuccessPage({})
    await renderSuccessPage({ reference: '' })
    expect(verifyTransaction).not.toHaveBeenCalled()
  })

  it('does not claim confirmation when booking persistence fails', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    verifyTransaction.mockResolvedValueOnce({
      status: true,
      data: { status: 'success' },
    })
    ;(upsertBookingFromPaystack as jest.Mock).mockRejectedValueOnce(
      new Error('db down')
    )

    await renderSuccessPage({ reference: 'ref_123' })
    expect(
      screen.getByRole('heading', {
        name: /payment received — confirmation pending/i,
      })
    ).toBeInTheDocument()
    expect(screen.queryByText(/your stay is confirmed/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /contact support/i })
    ).toBeInTheDocument()
  })
})
