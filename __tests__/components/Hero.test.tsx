import { render, screen } from '@testing-library/react'
import Hero from '@/components/Hero'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Hero', () => {
  it('renders the hero section', () => {
    render(<Hero />)
    expect(screen.getByText('Premium Shortlet')).toBeInTheDocument()
    expect(screen.getByText('Apartments')).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<Hero />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Premium Shortlet')
  })

  it('renders the description text', () => {
    render(<Hero />)
    expect(screen.getByText(/Experience luxury, comfort, and exceptional service/i)).toBeInTheDocument()
  })

  it('renders both CTA buttons', () => {
    render(<Hero />)
    expect(screen.getByText('Book Your Stay')).toBeInTheDocument()
    expect(screen.getByText('Explore Apartments')).toBeInTheDocument()
  })

  it('has correct links for CTA buttons', () => {
    render(<Hero />)
    const bookButton = screen.getByText('Book Your Stay').closest('a')
    const exploreButton = screen.getByText('Explore Apartments').closest('a')
    
    expect(bookButton).toHaveAttribute('href', '/booking')
    expect(exploreButton).toHaveAttribute('href', '/apartments')
  })
})

