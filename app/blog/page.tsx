import { Metadata } from "next";
import { blogPosts } from "@/lib/data/blog";
import BlogCard from "@/components/BlogCard";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description: "Discover tips, guides, and insights about shortlet accommodations, Abuja, Lagos, and making the most of your stay.",
};

export default function BlogPage() {
  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and insights to enhance your shortlet experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

