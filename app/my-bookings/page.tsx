"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { apartments } from "@/lib/data/apartments";
import { Calendar, MapPin, Users, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  reference: string;
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amountPaid: number;
  status: string;
  bookerName: string | null;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getApartmentById(id: string) {
  return apartments.find((apt) => apt.id === id);
}

function getBookingStatus(checkIn: string, checkOut: string, status: string) {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (status === "CANCELLED") return { label: "Cancelled", color: "bg-red-100 text-red-800" };
  if (now < checkInDate) return { label: "Upcoming", color: "bg-blue-100 text-blue-800" };
  if (now >= checkInDate && now <= checkOutDate) return { label: "Active", color: "bg-green-100 text-green-800" };
  return { label: "Completed", color: "bg-gray-100 text-gray-800" };
}

export default function MyBookingsPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push("/login?redirect=/my-bookings");
      return;
    }

    if (session?.access_token) {
      fetchBookings();
    }
  }, [authLoading, user, session, router]);

  async function fetchBookings() {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/my-bookings", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to fetch bookings");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      
      if (errorMsg.includes("TLS") || errorMsg.includes("certificate") || errorMsg.includes("Database")) {
        setError("Database connection issue. Please contact support.");
      } else if (errorMsg.includes("Not authenticated") || errorMsg.includes("token")) {
        setError("Session expired. Please log in again.");
        router.push("/login?redirect=/my-bookings");
        return;
      } else {
        setError(`Failed to load your bookings: ${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Show loading while fetching bookings
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-3 text-gray-600">Loading your bookings...</span>
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => {
    const checkInDate = new Date(b.checkIn);
    return checkInDate > new Date() && b.status !== "CANCELLED";
  });

  const pastBookings = bookings.filter((b) => {
    const checkOutDate = new Date(b.checkOut);
    return checkOutDate <= new Date() || b.status === "CANCELLED";
  });

  const activeBookings = bookings.filter((b) => {
    const now = new Date();
    const checkInDate = new Date(b.checkIn);
    const checkOutDate = new Date(b.checkOut);
    return now >= checkInDate && now <= checkOutDate && b.status !== "CANCELLED";
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.email}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/apartments">Book Another Stay</Link>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start planning your next stay at LoftyXphereHomes
            </p>
            <Button asChild>
              <Link href="/apartments">Browse Apartments</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Currently Staying
                </h2>
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Upcoming Bookings
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Past Bookings
                </h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} isPast />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, isPast = false }: { booking: Booking; isPast?: boolean }) {
  const apartment = getApartmentById(booking.apartmentId);
  const status = getBookingStatus(booking.checkIn, booking.checkOut, booking.status);

  if (!apartment) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 ${
        isPast ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
          <Image
            src={apartment.images[0]}
            alt={apartment.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{apartment.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {apartment.location.area}, {apartment.location.city}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-500">Check-in</p>
              <p className="font-medium">{formatDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="text-gray-500">Check-out</p>
              <p className="font-medium">{formatDate(booking.checkOut)}</p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-medium">
                {booking.nights} night{booking.nights !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total Paid</p>
              <p className="font-medium">
                ₦{booking.amountPaid.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Ref: {booking.reference}
            </p>
            <Link
              href={`/apartments/${booking.apartmentId}`}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
            >
              View Apartment
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
