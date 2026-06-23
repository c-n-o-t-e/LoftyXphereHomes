import { render, screen } from '@testing-library/react'
import Hero from '@/components/Hero'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('@/components/HeroSearchBar', () => {
  return function MockHeroSearchBar() {
    return <div data-testid="hero-search-bar">HeroSearchBar</div>
  }
})

const mockHeroVideo = {
  id: 'hero-1',
  mobileMp4Url: 'https://example.supabase.co/mobile.mp4',
  desktopMp4Url: 'https://example.supabase.co/desktop.mp4',
  posterUrl: 'https://example.supabase.co/poster.webp',
  updatedAt: new Date().toISOString(),
}

describe('Hero', () => {
  it('renders the hero section with main content', () => {
    render(<Hero heroVideo={mockHeroVideo} />)
    expect(screen.getByText('Live Lofty.')).toBeInTheDocument()
    expect(screen.getByText('Stay Different.')).toBeInTheDocument()
  })

  it('renders poster immediately when hero video is configured', () => {
    const { container } = render(<Hero heroVideo={mockHeroVideo} />)
    const poster = container.querySelector('img[src="https://example.supabase.co/poster.webp"]')
    expect(poster).toBeInTheDocument()
  })

  it('renders responsive video sources when hero video is configured', () => {
    const { container } = render(<Hero heroVideo={mockHeroVideo} />)
    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    const sources = video?.querySelectorAll('source')
    expect(sources?.length).toBe(2)
  })

  it('uses gradient backdrop when no hero video is configured', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('.from-stone-900')).toBeInTheDocument()
  })

  it('does not show a blocking loading spinner', () => {
    render(<Hero heroVideo={mockHeroVideo} />)
    expect(screen.queryByLabelText('Loading hero video')).not.toBeInTheDocument()
  })

  it('renders the HeroSearchBar component', () => {
    render(<Hero heroVideo={mockHeroVideo} />)
    expect(screen.getByTestId('hero-search-bar')).toBeInTheDocument()
  })
})
