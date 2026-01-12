import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/data/blog";
import { Calendar, Clock, User } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = getBlogPostById(id);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = getBlogPostById(id);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="mb-4">
            <span className="inline-block bg-[#FA5C5C]/10 text-[#FA5C5C] px-3 py-1 rounded-full text-sm font-semibold border border-[#FA5C5C]/20">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-black/70 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-[#FA5C5C]" />
              <span className="font-medium text-black">{post.author}</span>
              <span className="ml-2 text-black/60">{post.authorRole}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-[#FA5C5C]" />
              {formatDate(post.publishedDate)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-[#FA5C5C]" />
              {post.readTime} min read
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-12 border border-black/10">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none">
          <div
            className="text-black/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-black/10">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-black/5 text-black/80 px-3 py-1 rounded-full text-sm border border-black/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

