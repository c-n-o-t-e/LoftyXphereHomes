import BlogPostPage, { generateMetadata } from '@/app/blog/[id]/page'
import { getBlogPostById } from '@/lib/data/blog'

describe('Blog Post Page - generateMetadata', () => {
  it('returns metadata when post exists', async () => {
    const post = getBlogPostById('top-5-amenities-guests-love')
    const params = Promise.resolve({ id: 'top-5-amenities-guests-love' })
    const metadata = await generateMetadata({ params })
    
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe(post?.title)
    expect(metadata.description).toBe(post?.excerpt)
    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph?.title).toBe(post?.title)
  })

  it('returns not found metadata when post does not exist', async () => {
    const params = Promise.resolve({ id: 'non-existent-post' })
    const metadata = await generateMetadata({ params })
    
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Blog Post Not Found')
  })
})

