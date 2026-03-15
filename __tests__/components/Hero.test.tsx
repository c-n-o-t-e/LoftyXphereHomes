import { render, screen, fireEvent } from '@testing-library/react'
import Hero from '@/components/Hero'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...props} />
  ),
}))

jest.mock('@/components/HeroSearchBar', () => {
  return function MockHeroSearchBar() {
    return <div data-testid="hero-search-bar">HeroSearchBar</div>
  }
})

describe('Hero', () => {
  it('renders the hero section with main content', () => {
    render(<Hero />)
    expect(screen.getByText('Live Lofty.')).toBeInTheDocument()
    expect(screen.getByText('Stay Different.')).toBeInTheDocument()
  })

  it('renders the LoftyXphereHomes label', () => {
    render(<Hero />)
    expect(screen.getByText('LoftyXphereHomes')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<Hero />)
    expect(screen.getByText(/Where luxury meets comfort in the heart of Abuja/i)).toBeInTheDocument()
  })

  it('renders the HeroSearchBar component', () => {
    render(<Hero />)
    expect(screen.getByTestId('hero-search-bar')).toBeInTheDocument()
  })

  it('renders scroll indicator on desktop', () => {
    render(<Hero />)
    expect(screen.getByText('Scroll to explore')).toBeInTheDocument()
  })

  it('renders a video element with source pointing to hero video', () => {
    const { container } = render(<Hero />)
    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    const source = video?.querySelector('source')
    expect(source).toHaveAttribute('src', expect.stringContaining('pexels.com'))
    expect(source).toHaveAttribute('type', 'video/mp4')
  })

  it('uses fallback image as video poster', () => {
    const { container } = render(<Hero />)
    const video = container.querySelector('video')
    expect(video).toHaveAttribute('poster', expect.stringContaining('unsplash.com'))
  })

  it('shows fallback background when video errors', () => {
    const { container } = render(<Hero />)
    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    fireEvent.error(video!)
    expect(container.querySelector('video')).toBeNull()
    // Fallback is a div with bg-cover bg-center and inline backgroundImage
    const fallback = container.querySelector('.bg-cover.bg-center')
    expect(fallback).toBeInTheDocument()
  })

  it('has gradient overlay elements for text readability', () => {
    const { container } = render(<Hero />)
    const gradients = container.querySelectorAll('.bg-gradient-to-b, .bg-gradient-to-r')
    expect(gradients.length).toBeGreaterThanOrEqual(2)
  })

  it('video element has play method for autoplay', () => {
    const { container } = render(<Hero />)
    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(typeof (video as HTMLVideoElement).play).toBe('function')
  })

  it('has correct section structure and classes', () => {
    const { container } = render(<Hero />)
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveClass('relative', 'min-h-screen', 'overflow-hidden')
  })

  it('heading has drop shadow and white text', () => {
    render(<Hero />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-white', 'drop-shadow-2xl')
  })
})
