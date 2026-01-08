export interface Review {
  id: string;
  apartmentId: string;
  guestName: string;
  guestLocation?: string;
  rating: number;
  comment: string;
  date: string;
  source?: "airbnb" | "manual";
  airbnbListingId?: string;
}

export interface Apartment {
  id: string;
  name: string;
  shortDescription: string;
  location: {
    city: string;
    area: string;
  };
  pricePerNight: number;
  images: string[];
  amenities: string[];
  houseRules: string[];
  capacity: number;
  beds: number;
  baths: number;
  bookingUrl?: string;
  airbnbUrl?: string;
  airbnbListingId?: string;
  rating: number;
  reviews: number;
  reviewList?: Review[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  apartmentId?: string;
  source?: "airbnb" | "manual";
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  category: "booking" | "partnership" | "long-stay" | "complaints";
  message: string;
}

export interface BookingInquiryFormData {
  fullName: string;
  email: string;
  phone: string;
  cityVisiting: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  apartmentId: string;
  message: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  image: string;
  category: string;
  readTime: number;
  tags: string[];
}
