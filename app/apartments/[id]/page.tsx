import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getApartmentById } from "@/lib/data/apartments";
import { MapPin, Users, Bed, Bath, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SITE_NAME, CHECK_IN_TIME, CHECK_OUT_TIME } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const apartment = getApartmentById(id);

  if (!apartment) {
    return {
      title: "Apartment Not Found",
    };
  }

  return {
    title: apartment.name,
    description: apartment.shortDescription,
    openGraph: {
      title: apartment.name,
      description: apartment.shortDescription,
      images: apartment.images,
    },
  };
}

export default async function ApartmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const apartment = getApartmentById(id);

  if (!apartment) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {apartment.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {apartment.location.area}, {apartment.location.city}
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-semibold">{apartment.rating}</span>
              <span className="ml-1">({apartment.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="md:col-span-2">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src={apartment.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80"}
                alt={apartment.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          {apartment.images.slice(1, 5).map((image, index) => (
            <div key={index} className="relative h-48 rounded-2xl overflow-hidden">
              <Image
                src={image}
                alt={`${apartment.name} - Image ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed">{apartment.shortDescription}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {apartment.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">House Rules</h2>
              <ul className="space-y-2">
                {apartment.houseRules.map((rule) => (
                  <li key={rule} className="flex items-start text-gray-700">
                    <span className="mr-2">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>Check-in:</strong> {CHECK_IN_TIME} | <strong>Check-out:</strong> {CHECK_OUT_TIME}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(apartment.pricePerNight)}
                  </span>
                  <span className="text-gray-600 ml-2">/ night</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {apartment.capacity} guests
                  </div>
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {apartment.beds} bed{apartment.beds > 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {apartment.baths} bath{apartment.baths > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {apartment.bookingUrl ? (
                <Button asChild className="w-full rounded-full mb-4" size="lg">
                  <a href={apartment.bookingUrl} target="_blank" rel="noopener noreferrer">
                    Book Now
                  </a>
                </Button>
              ) : (
                <Button asChild className="w-full rounded-full mb-4" size="lg">
                  <Link href={`/booking?apartment=${apartment.id}`}>Book Now</Link>
                </Button>
              )}

              <Button asChild variant="outline" className="w-full rounded-full" size="lg">
                <Link href="/contact">Send Inquiry</Link>
              </Button>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{apartment.rating}</span>
                    <span className="ml-1 text-gray-600">({apartment.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

