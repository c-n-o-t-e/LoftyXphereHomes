"use client";

/**
 * Airbnb Reviews Embed Component
 * 
 * This component allows you to embed Airbnb reviews directly from your listings.
 * 
 * To use:
 * 1. Get your Airbnb listing ID from your listing URL
 * 2. Replace YOUR_AIRBNB_LISTING_ID with your actual listing ID
 * 3. Optionally, customize the height and styling
 * 
 * Note: Airbnb doesn't provide a direct public API for reviews, but you can:
 * - Use Airbnb's embed widget (if available)
 * - Manually copy reviews and add them to lib/data/reviews.ts
 * - Use a third-party service that integrates with Airbnb
 */

interface AirbnbReviewsProps {
  listingId: string;
  height?: string;
}

export default function AirbnbReviews({ 
  listingId, 
  height = "600px" 
}: AirbnbReviewsProps) {
  // Airbnb doesn't have a direct embed for reviews
  // This is a placeholder that shows how you could integrate if Airbnb provides an embed option
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Airbnb Reviews
        </h3>
        <p className="text-gray-600 mb-4">
          Reviews are displayed from our integrated review system.
        </p>
        <a
          href={`https://www.airbnb.com/rooms/${listingId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          View on Airbnb
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

/**
 * Alternative: If you want to use Airbnb's official embed (when available)
 * You can replace the above component with an iframe embed
 * 
 * Example:
 * <iframe
 *   src={`https://www.airbnb.com/rooms/${listingId}/reviews`}
 *   width="100%"
 *   height={height}
 *   frameBorder="0"
 *   scrolling="no"
 * />
 */

