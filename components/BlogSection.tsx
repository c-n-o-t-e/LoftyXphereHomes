"use client";

import { motion } from "framer-motion";
import { getFeaturedBlogPosts } from "@/lib/data/blog";
import BlogCard from "./BlogCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogSection() {
  const featuredPosts = getFeaturedBlogPosts(3);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6">
            Latest from Our Blog
          </h2>
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
            Discover tips, guides, and insights to make your shortlet experience even better
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="rounded-full border-black/20 hover:bg-[#FA5C5C] hover:text-white hover:border-[#FA5C5C]" variant="outline">
            <Link href="/blog">
              View All Blog Posts
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

