import { render, screen } from '@testing-library/react'
import BlogCard from '@/components/BlogCard'
import { BlogPost } from '@/lib/types'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

const mockBlogPost: BlogPost = {
  id: 'test-blog-01',
  title: 'Test Blog Post',
  excerpt: 'This is a test blog post excerpt',
  content: '<p>Test content</p>',
  author: 'John Doe',
  authorRole: 'Writer',
  publishedDate: '2024-03-15',
  image: 'https://example.com/image.jpg',
  category: 'Tips',
  readTime: 5,
  tags: ['test', 'blog'],
}

describe('BlogCard', () => {
  it('renders blog post title', () => {
    render(<BlogCard post={mockBlogPost} />)
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument()
  })

  it('renders blog post excerpt', () => {
    render(<BlogCard post={mockBlogPost} />)
    expect(screen.getByText('This is a test blog post excerpt')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<BlogCard post={mockBlogPost} />)
    expect(screen.getByText('Tips')).toBeInTheDocument()
  })

  it('renders author information', () => {
    render(<BlogCard post={mockBlogPost} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders read time', () => {
    render(<BlogCard post={mockBlogPost} />)
    expect(screen.getByText(/5 min read/i)).toBeInTheDocument()
  })

  it('links to blog post detail page', () => {
    render(<BlogCard post={mockBlogPost} />)
    const link = screen.getByText('Test Blog Post').closest('a')
    expect(link).toHaveAttribute('href', '/blog/test-blog-01')
  })
})

