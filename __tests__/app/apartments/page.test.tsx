import { screen } from '@testing-library/react'
import { ApartmentsPageClient } from '@/app/apartments/ApartmentsPageClient'
import { renderWithQueryClient } from '@/lib/testing/render-with-query-client'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

const initialImageSets = {
  'horizon-suite': [
    {
      thumbnail: 'https://example.com/thumb.jpg',
      medium: 'https://example.com/medium.jpg',
      large: 'https://example.com/large.jpg',
    },
  ],
  'skyline-suite': [
    {
      thumbnail: 'https://example.com/thumb-2.jpg',
      medium: 'https://example.com/medium-2.jpg',
      large: 'https://example.com/large-2.jpg',
    },
  ],
  'meridian-suite': [],
  'lumen-suite': [],
}

const initialVideoSummaries = {
  'horizon-suite': {
    apartmentId: 'horizon-suite',
    posterUrl: 'https://example.com/poster.jpg',
  },
}

describe('Apartments Page', () => {
  it('renders the page heading', () => {
    renderWithQueryClient(
      <ApartmentsPageClient
        initialImageSets={initialImageSets}
        initialVideoSummaries={initialVideoSummaries}
      />,
    )
    expect(screen.getByText('Our Apartments')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    renderWithQueryClient(
      <ApartmentsPageClient
        initialImageSets={initialImageSets}
        initialVideoSummaries={initialVideoSummaries}
      />,
    )
    expect(screen.getByText(/Premium shortlet suites in Wuye, Abuja/i)).toBeInTheDocument()
  })

  it('renders apartment cards', () => {
    renderWithQueryClient(
      <ApartmentsPageClient
        initialImageSets={initialImageSets}
        initialVideoSummaries={initialVideoSummaries}
      />,
    )
    const apartmentCards = screen.getAllByText(/Suite/i)
    expect(apartmentCards.length).toBeGreaterThan(0)
  })
})
