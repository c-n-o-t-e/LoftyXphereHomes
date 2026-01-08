"use client";

import { Review } from "@/lib/types";
import { Star, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface ApartmentReviewsProps {
  reviews: Review[];
  apartmentName: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ApartmentReviews({ reviews, apartmentName }: ApartmentReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Guest Reviews
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="font-semibold text-gray-900 mr-2">
                    {review.guestName}
                  </h3>
                  {review.source === "airbnb" && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Airbnb
                    </span>
                  )}
                </div>
                {review.guestLocation && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {review.guestLocation}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              {review.comment}
            </p>

            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(review.date)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

