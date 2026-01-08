import { render, screen } from '@testing-library/react'
import BlogSection from '@/components/BlogSection'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('BlogSection', () => {
  it('renders the section heading', () => {
    render(<BlogSection />)
    expect(screen.getByText('Latest from Our Blog')).toBeInTheDocument()
  })

  it('renders the section description', () => {
    render(<BlogSection />)
    expect(screen.getByText(/Discover tips, guides, and insights/i)).toBeInTheDocument()
  })

  it('renders blog cards', () => {
    render(<BlogSection />)
    // Should render at least one blog card
    const blogCards = screen.getAllByText(/Top 5 Amenities|Exploring Abuja|How to Make/i)
    expect(blogCards.length).toBeGreaterThan(0)
  })

  it('renders view all blog posts button', () => {
    render(<BlogSection />)
    expect(screen.getByText('View All Blog Posts')).toBeInTheDocument()
  })
})

