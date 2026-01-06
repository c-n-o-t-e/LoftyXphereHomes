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
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Your Stay
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Reserve your perfect shortlet apartment or send us an inquiry
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {!showForm ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Book?
                </h2>
                <p className="text-gray-600 mb-8">
                  Click the button below to proceed to our booking platform, or fill out the inquiry form if you have questions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleBookingClick}
                  size="lg"
                  className="flex-1 rounded-full"
                >
                  Book Now
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full"
                >
                  Send Inquiry Instead
                </Button>
              </div>

              {apartment && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Selected Apartment:</p>
                  <p className="font-semibold text-gray-900">{apartment.name}</p>
                  <p className="text-sm text-gray-600">
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
                className="mb-6"
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
      <div className="pt-20 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}

