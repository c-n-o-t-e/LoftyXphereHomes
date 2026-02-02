import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApartmentById } from "@/lib/data/apartments";
import { MapPin, Star, Check } from "lucide-react";
import { YourReservationCard } from "@/components/YourReservationCard";
import { ApartmentImageGallery } from "@/components/ApartmentImageGallery";
import { CHECK_IN_TIME, CHECK_OUT_TIME } from "@/lib/constants";

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

  return (
    <div className="pt-20 pb-12 sm:pb-16 md:pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12 pt-8 sm:pt-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black mb-4 sm:mb-6 px-2">
            {apartment.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-black/70 px-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-[#FA5C5C]" />
              {apartment.location.area}, {apartment.location.city}
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-[#FA5C5C] text-[#FA5C5C] mr-1" />
              <span className="font-semibold text-black">{apartment.rating}</span>
              <span className="ml-1 text-black/70">({apartment.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <ApartmentImageGallery
          images={apartment.images}
          name={apartment.name}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">About this place</h2>
              <p className="text-black/80 leading-relaxed">{apartment.shortDescription}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {apartment.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center text-black/80">
                    <Check className="h-5 w-5 text-[#FA5C5C] mr-2 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">House Rules</h2>
              <ul className="space-y-2">
                {apartment.houseRules.map((rule) => (
                  <li key={rule} className="flex items-start text-black/80">
                    <span className="mr-2 text-[#FA5C5C] font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-4 bg-black/5 rounded-xl border border-black/10">
                <p className="text-sm text-black/70">
                  <strong className="text-black">Check-in:</strong> {CHECK_IN_TIME} | <strong className="text-black">Check-out:</strong> {CHECK_OUT_TIME}
                </p>
              </div>
            </div>
          </div>

          {/* Your Reservation Card */}
          <div className="lg:col-span-1">
            <YourReservationCard
              apartmentId={apartment.id}
              pricePerNight={apartment.pricePerNight}
              capacity={apartment.capacity}
              beds={apartment.beds}
              baths={apartment.baths}
              bookingUrl={apartment.bookingUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

