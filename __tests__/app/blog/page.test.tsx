import { render, screen } from '@testing-library/react'
import BlogPage from '@/app/blog/page'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Blog Page', () => {
  it('renders the page heading', () => {
    render(<BlogPage />)
    expect(screen.getByText('Our Blog')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    render(<BlogPage />)
    expect(screen.getByText(/Tips, guides, and insights/i)).toBeInTheDocument()
  })

  it('renders blog cards', () => {
    render(<BlogPage />)
    // Should render at least one blog card
    const blogCards = screen.getAllByText(/Top 5 Amenities|Exploring Abuja|How to Make/i)
    expect(blogCards.length).toBeGreaterThan(0)
  })
})

