"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookingInquiryForm } from "@/components/BookingInquiryForm";
import { apartments } from "@/lib/data/apartments";
import { ExternalLink } from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const apartmentId = searchParams.get("apartment");
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (apartmentId) {
      setSelectedApartment(apartmentId);
    }
  }, [apartmentId]);

  const apartment = selectedApartment
    ? apartments.find((apt) => apt.id === selectedApartment)
    : null;

  const defaultBookingUrl = process.env.NEXT_PUBLIC_DEFAULT_BOOKING_URL || "#";

  const handleBookingClick = () => {
    if (apartment?.bookingUrl) {
      window.open(apartment.bookingUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(defaultBookingUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="pt-20 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16 pt-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            Book Your Stay
          </h1>
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
            Reserve your perfect shortlet apartment or send us an inquiry
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-black/10">
          {!showForm ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black mb-4">
                  Ready to Book?
                </h2>
                <p className="text-black/70 mb-8">
                  Click the button below to proceed to our booking platform, or fill out the inquiry form if you have questions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleBookingClick}
                  size="lg"
                  className="flex-1 rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white"
                >
                  Book Now
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full border-black/20 hover:bg-[#FA5C5C] hover:text-white hover:border-[#FA5C5C]"
                >
                  Send Inquiry Instead
                </Button>
              </div>

              {apartment && (
                <div className="mt-8 p-6 bg-black/5 rounded-xl border border-black/10">
                  <p className="text-sm text-black/70 mb-2">Selected Apartment:</p>
                  <p className="font-semibold text-black">{apartment.name}</p>
                  <p className="text-sm text-black/70">
                    {apartment.location.area}, {apartment.location.city}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <Button
                onClick={() => setShowForm(false)}
                variant="ghost"
                className="mb-6 text-black hover:text-[#FA5C5C] hover:bg-black/5"
              >
                ← Back to Booking Options
              </Button>
              <BookingInquiryForm
                defaultApartmentId={selectedApartment || undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 pb-20 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-black/70">Loading...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}

