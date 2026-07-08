import { Metadata } from "next";
import { blogPosts } from "@/lib/data/blog";
import BlogCard from "@/components/BlogCard";
import { LOCATION_SEO } from "@/lib/content/seoCopy";

export const metadata: Metadata = {
  title: "Blog",
  description: `Tips and guides on luxury serviced apartments, shortlet stays, and making the most of your time in ${LOCATION_SEO}.`,
};

export default function BlogPage() {
  return (
    <div className="pt-20 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 pt-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            Our Blog
          </h1>
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
            Insights on luxury serviced apartment living and shortlet stays in {LOCATION_SEO}
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
