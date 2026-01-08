import { Review } from "../types";

/**
 * Reviews data structure
 * 
 * To integrate Airbnb reviews:
 * 1. Manual Entry: Copy reviews from your Airbnb listings and add them here
 * 2. Airbnb Embed: Use Airbnb's embed widget (see components/AirbnbReviews.tsx)
 * 3. API Integration: If you have Airbnb API access, create an API route to fetch reviews
 * 
 * For each review, include:
 * - apartmentId: Match to the apartment's id
 * - guestName: Guest's name from Airbnb
 * - rating: 1-5 stars
 * - comment: Review text
 * - date: Review date (YYYY-MM-DD format)
 * - source: "airbnb" or "manual"
 * - airbnbListingId: Your Airbnb listing ID (optional but helpful)
 */

export const reviews: Review[] = [
  // Example reviews for Lofty Abuja Suite
  {
    id: "review-abuja-01",
    apartmentId: "lofty-abuja-01",
    guestName: "Sarah M.",
    guestLocation: "Lagos, Nigeria",
    rating: 5,
    comment: "Absolutely fantastic stay! The apartment was spotless, well-equipped, and in a perfect location. The host was very responsive and helpful. Will definitely book again!",
    date: "2024-03-15",
    source: "airbnb",
    airbnbListingId: "YOUR_AIRBNB_LISTING_ID",
  },
  {
    id: "review-abuja-02",
    apartmentId: "lofty-abuja-01",
    guestName: "Michael T.",
    guestLocation: "Port Harcourt, Nigeria",
    rating: 5,
    comment: "Great value for money. The apartment had everything we needed and the location was perfect for our business meetings. Highly recommend!",
    date: "2024-03-10",
    source: "airbnb",
  },
  {
    id: "review-abuja-03",
    apartmentId: "lofty-abuja-01",
    guestName: "Amina K.",
    guestLocation: "Kano, Nigeria",
    rating: 4,
    comment: "Lovely apartment with modern amenities. The Wi-Fi was fast and reliable, perfect for remote work. Only minor issue was the noise from the street, but overall a great stay.",
    date: "2024-03-05",
    source: "airbnb",
  },
  // Example reviews for Lofty Lagos Premium
  {
    id: "review-lagos-01",
    apartmentId: "lofty-lagos-01",
    guestName: "David O.",
    guestLocation: "Abuja, Nigeria",
    rating: 5,
    comment: "Stunning apartment with amazing city views! The space was perfect for our family, and the amenities were top-notch. The host went above and beyond to make our stay comfortable.",
    date: "2024-03-20",
    source: "airbnb",
  },
  {
    id: "review-lagos-02",
    apartmentId: "lofty-lagos-01",
    guestName: "Jennifer L.",
    guestLocation: "London, UK",
    rating: 5,
    comment: "Best Airbnb experience in Lagos! The apartment exceeded our expectations. Clean, spacious, and in a great location. The security was excellent too.",
    date: "2024-03-12",
    source: "airbnb",
  },
  {
    id: "review-lagos-03",
    apartmentId: "lofty-lagos-01",
    guestName: "James P.",
    guestLocation: "Lagos, Nigeria",
    rating: 4,
    comment: "Very comfortable stay. The apartment had all the essentials and more. Great for business travelers. The only downside was the parking space was a bit tight.",
    date: "2024-03-08",
    source: "airbnb",
  },
  // Add more reviews for other apartments as needed
];

/**
 * Get reviews for a specific apartment
 */
export function getReviewsByApartmentId(apartmentId: string): Review[] {
  return reviews.filter((review) => review.apartmentId === apartmentId);
}

/**
 * Get all reviews (for testimonial slider)
 */
export function getAllReviews(): Review[] {
  return reviews;
}

/**
 * Get featured reviews (for homepage testimonial slider)
 */
export function getFeaturedReviews(limit: number = 6): Review[] {
  return reviews.slice(0, limit);
}

/**
 * Get reviews by source (airbnb or manual)
 */
export function getReviewsBySource(source: "airbnb" | "manual"): Review[] {
  return reviews.filter((review) => review.source === source);
}

