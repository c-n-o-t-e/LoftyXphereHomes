import { render, screen } from '@testing-library/react'
import BlogPostPage from '@/app/blog/[id]/page'
import { notFound } from 'next/navigation'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

describe('Blog Post Page', () => {
  it('renders blog post title when post exists', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    expect(
      screen.getByText(/Top 5 Amenities in Our Luxury Serviced Apartments in Wuye, Abuja/i),
    ).toBeInTheDocument()
  })

  it('renders blog post category', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    expect(screen.getByText('Amenities')).toBeInTheDocument()
  })

  it('renders author information', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    expect(screen.getByText(/Sarah Adebayo/i)).toBeInTheDocument()
    expect(screen.getByText(/Guest Experience Manager/i)).toBeInTheDocument()
  })

  it('renders published date', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    expect(screen.getByText(/March 15, 2024/i)).toBeInTheDocument()
  })

  it('renders read time', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    expect(screen.getByText(/5 min read/i)).toBeInTheDocument()
  })

  it('renders blog post image', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    const image = screen.getByAltText(
      /Top 5 Amenities in Our Luxury Serviced Apartments in Wuye, Abuja/i,
    )
    expect(image).toBeInTheDocument()
  })

  it('renders blog post content', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    const wifiElements = screen.getAllByText(/Starlink Wi-Fi/i)
    expect(wifiElements.length).toBeGreaterThan(0)
  })

  it('renders blog post tags', async () => {
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    render(await BlogPostPage({ params }))
    expect(screen.getByText('#amenities')).toBeInTheDocument()
    expect(screen.getByText('#guest experience')).toBeInTheDocument()
    expect(screen.getByText('#Wuye Abuja')).toBeInTheDocument()
  })

  it('calls notFound when post does not exist', async () => {
    const params = Promise.resolve({ id: 'non-existent-post' })
    try {
      render(await BlogPostPage({ params }))
    } catch (e) {
      // Expected to call notFound
    }
    expect(notFound).toHaveBeenCalled()
  })
})
