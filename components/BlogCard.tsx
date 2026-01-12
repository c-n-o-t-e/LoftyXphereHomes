"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, User } from "lucide-react";
import { BlogPost } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col">
        <Link href={`/blog/${post.id}`}>
          <div className="relative h-64 overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-black/10">
              <span className="text-sm font-semibold text-black">{post.category}</span>
            </div>
          </div>
        </Link>
        <CardContent className="p-6 flex flex-col flex-grow">
          <Link href={`/blog/${post.id}`}>
            <h3 className="text-xl font-bold text-black mb-3 group-hover:text-[#FA5C5C] transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-black/70 text-sm mb-4 line-clamp-3 flex-grow">
              {post.excerpt}
            </p>
          </Link>

          <div className="space-y-3 pt-4 border-t border-black/10">
            <div className="flex items-center text-xs text-black/60 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(post.publishedDate)}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {post.readTime} min read
              </div>
            </div>
            <div className="flex items-center text-sm text-black/70">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">{post.author}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

