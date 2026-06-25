import { screen } from '@testing-library/react'
import { ApartmentsPageClient } from '@/app/apartments/ApartmentsPageClient'
import { renderWithQueryClient } from '@/lib/testing/render-with-query-client'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

const initialImageSets = {
  'lofty-horizon-suite': [
    {
      thumbnail: 'https://example.com/thumb.jpg',
      medium: 'https://example.com/medium.jpg',
      large: 'https://example.com/large.jpg',
    },
  ],
  'lofty-skyline-suite': [
    {
      thumbnail: 'https://example.com/thumb-2.jpg',
      medium: 'https://example.com/medium-2.jpg',
      large: 'https://example.com/large-2.jpg',
    },
  ],
  'lofty-meridian-suite': [],
  'lofty-lumen-suite': [],
}

describe('Apartments Page', () => {
  it('renders the page heading', () => {
    renderWithQueryClient(
      <ApartmentsPageClient initialImageSets={initialImageSets} />,
    )
    expect(screen.getByText('Our Apartments')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    renderWithQueryClient(
      <ApartmentsPageClient initialImageSets={initialImageSets} />,
    )
    expect(screen.getByText(/Premium shortlet suites in Wuye, Abuja/i)).toBeInTheDocument()
  })

  it('renders apartment cards', () => {
    renderWithQueryClient(
      <ApartmentsPageClient initialImageSets={initialImageSets} />,
    )
    const apartmentCards = screen.getAllByText(/Suite/i)
    expect(apartmentCards.length).toBeGreaterThan(0)
  })
})
