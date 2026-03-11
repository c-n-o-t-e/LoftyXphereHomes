"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Calendar, Users, Bed, Bath, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStayDiscountAmount, PAYSTACK_FEE } from "@/lib/constants";
import { DatePickerCalendar } from "@/components/DatePickerCalendar";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDateForInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface BookingRange {
  checkIn: string;
  checkOut: string;
}

interface YourReservationCardProps {
  apartmentId: string;
  pricePerNight: number;
  capacity: number;
  beds: number;
  baths: number;
  bookingUrl?: string | null;
}

export function YourReservationCard({
  apartmentId,
  pricePerNight,
  capacity,
  beds,
  baths,
  bookingUrl,
}: YourReservationCardProps) {
  const today = useMemo(() => {
    const t = new Date();
    return formatDateForInput(t);
  }, []);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Calendar popup state
  const [openCalendar, setOpenCalendar] = useState<"checkIn" | "checkOut" | null>(null);

  // Availability data from API
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [bookingRanges, setBookingRanges] = useState<BookingRange[]>([]);

  // Fetch availability data for this apartment
  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch(`/api/availability?apartmentId=${encodeURIComponent(apartmentId)}`);
      if (res.ok) {
        const data = await res.json();
        setBlockedDates(data.blockedDates || []);
        setBookingRanges(data.bookingRanges || []);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  }, [apartmentId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const calculation = useMemo(() => {
    if (!checkOut) return null;
    const inDate = parseLocalDate(checkIn);
    const outDate = parseLocalDate(checkOut);
    if (outDate <= inDate) return null;
    const nights = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = pricePerNight * nights;
    const discountAmount = getStayDiscountAmount(nights);
    const afterDiscount = subtotal - discountAmount;
    const total = afterDiscount + PAYSTACK_FEE;
    return {
      nights,
      subtotal,
      discountAmount,
      hasDiscount: discountAmount > 0,
      total,
    };
  }, [checkIn, checkOut, pricePerNight]);

  const minCheckOut = checkIn
    ? (() => {
        const d = parseLocalDate(checkIn);
        d.setDate(d.getDate() + 1);
        return formatDateForInput(d);
      })()
    : today;

  /**
   * Compute disabled dates for the checkout calendar.
   * 
   * Rules (Airbnb-style):
   * 1. If user selects check-in on 11th and there's a booking starting on 14th,
   *    user can checkout on 12th, 13th, or 14th (checkout day = new guest check-in day)
   *    but NOT on 15th or later (would overlap with existing booking)
   * 
   * 2. Find the first booking that starts AFTER or ON the selected check-in date
   * 3. The maximum checkout date is that booking's check-in date
   * 4. All dates after that are disabled for checkout
   */
  const checkoutDisabledDates = useMemo(() => {
    if (!checkIn || bookingRanges.length === 0) return [];

    const checkInDate = parseLocalDate(checkIn);
    const disabled: string[] = [];

    // Find the first booking that starts after our check-in
    // (sorted by checkIn from the API)
    let maxCheckoutDate: Date | null = null;
    for (const range of bookingRanges) {
      const rangeCheckIn = parseLocalDate(range.checkIn);
      // If this booking starts after or on our check-in date
      if (rangeCheckIn > checkInDate) {
        // We can checkout up to and including this date (guest leaves morning, new guest arrives)
        // But we cannot checkout AFTER this date
        maxCheckoutDate = rangeCheckIn;
        break;
      }
    }

    // If there's a booking after our check-in, disable all dates after that booking's check-in
    if (maxCheckoutDate) {
      // Generate disabled dates starting from day after maxCheckoutDate
      const current = new Date(maxCheckoutDate);
      current.setDate(current.getDate() + 1);
      // Generate for next 2 years
      const twoYearsLater = new Date();
      twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
      while (current <= twoYearsLater) {
        disabled.push(formatDateForInput(current));
        current.setDate(current.getDate() + 1);
      }
    }

    return disabled;
  }, [checkIn, bookingRanges]);

  const handlePaystackBook = async () => {
    setPayError(null);
    if (!calculation) {
      setPayError("Please select check-in and check-out dates.");
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setPayError("Please enter your name.");
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setPayError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setPayError("Please enter a valid email address.");
      return;
    }
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setPayError("Please enter your phone number.");
      return;
    }
    setIsRedirecting(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: trimmedName,
          phone: trimmedPhone || undefined,
          amount: calculation.total,
          apartmentId,
          checkIn,
          checkOut,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || "Unable to start payment. Please try again.");
        setIsRedirecting(false);
        // If conflict (dates already booked), refresh availability and clear dates
        if (res.status === 409) {
          fetchAvailability();
          setCheckIn("");
          setCheckOut("");
        }
        return;
      }
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setPayError("Invalid response from payment. Please try again.");
    } catch {
      setPayError("Network error. Please try again.");
    }
    setIsRedirecting(false);
  };

  return (
    <div className="sticky top-24 bg-white border border-black/10 rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-medium text-black/70 mb-4">Your Reservation</h2>
      <div className="border-b border-black/10 pb-4 mb-4">
        {calculation ? (
          <p className="text-2xl font-bold text-black">
            {formatPrice(calculation.total)}
          </p>
        ) : (
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-black">
              {formatPrice(pricePerNight)}
            </span>
            <span className="text-black/60 ml-2">/ Night</span>
          </div>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-black/70">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1.5 text-[#FA5C5C]" />
            {capacity} guest{capacity !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1.5 text-[#FA5C5C]" />
            {beds} bed{beds !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1.5 text-[#FA5C5C]" />
            {baths} bath{baths !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {/* Check-in Date Picker */}
        <div>
          <Label className="text-xs uppercase tracking-wide text-black/80">
            Check-in
          </Label>
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => setOpenCalendar(openCalendar === "checkIn" ? null : "checkIn")}
              className="w-full h-11 px-3 flex items-center justify-between rounded-lg border border-black/20 bg-white text-left text-sm hover:border-black/40 transition-colors"
            >
              <span className={checkIn ? "text-black" : "text-black/50"}>
                {checkIn ? formatDisplayDate(checkIn) : "Select check-in date"}
              </span>
              <Calendar className="h-4 w-4 text-black/40" />
            </button>
            <DatePickerCalendar
              open={openCalendar === "checkIn"}
              onClose={() => setOpenCalendar(null)}
              value={checkIn}
              minDate={today}
              disabledDates={blockedDates}
              onSelect={(date) => {
                setCheckIn(date);
                // Clear checkout if it's now invalid
                if (checkOut && date >= checkOut) setCheckOut("");
                // Auto-open checkout calendar
                setTimeout(() => setOpenCalendar("checkOut"), 150);
              }}
              onClear={() => {
                setCheckIn("");
                setCheckOut("");
              }}
              placement="bottom"
            />
          </div>
        </div>

        {/* Check-out Date Picker */}
        <div>
          <Label className="text-xs uppercase tracking-wide text-black/80">
            Check-out
          </Label>
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => {
                if (!checkIn) {
                  setPayError("Please select a check-in date first.");
                  return;
                }
                setOpenCalendar(openCalendar === "checkOut" ? null : "checkOut");
              }}
              className="w-full h-11 px-3 flex items-center justify-between rounded-lg border border-black/20 bg-white text-left text-sm hover:border-black/40 transition-colors"
            >
              <span className={checkOut ? "text-black" : "text-black/50"}>
                {checkOut ? formatDisplayDate(checkOut) : "Select check-out date"}
              </span>
              <Calendar className="h-4 w-4 text-black/40" />
            </button>
            <DatePickerCalendar
              open={openCalendar === "checkOut"}
              onClose={() => setOpenCalendar(null)}
              value={checkOut}
              minDate={minCheckOut}
              disabledDates={checkoutDisabledDates}
              onSelect={(date) => setCheckOut(date)}
              onClear={() => setCheckOut("")}
              placement="bottom"
            />
          </div>
        </div>
      </div>

      {calculation && (
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between text-black/80">
            <span>
              {formatPrice(pricePerNight)} × {calculation.nights} day
              {calculation.nights !== 1 ? "s" : ""}
            </span>
            <span>{formatPrice(calculation.subtotal)}</span>
          </div>
          {calculation.hasDiscount && calculation.discountAmount > 0 && (
            <div className="flex justify-between items-center text-[#FA5C5C]">
              <span className="flex items-center gap-1.5">
                Stay discount
                <span className="relative group">
                  <Info className="h-4 w-4 text-black/40 cursor-help shrink-0" aria-label="Discount breakdown" />
                  <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 w-64 p-3 text-left text-xs font-normal text-white bg-gray-900 rounded-lg shadow-lg">
                    <p className="text-white/95 font-semibold">Length-of-stay discount</p>
                    <p className="mt-1.5 text-white/80 leading-relaxed">
                      We apply a discount to your daily rate based on how long you stay. The discount is given per night and increases with longer stays.
                    </p>
                    <ul className="mt-2.5 space-y-1.5 text-white/90 border-t border-white/20 pt-2">
                      <li><strong>3–6 nights:</strong> {formatPrice(10_000)} off each night</li>
                      <li><strong>1 week – 3 weeks:</strong> {formatPrice(20_000)} off each night</li>
                      <li><strong>1 month or more:</strong> {formatPrice(30_000)} off each night</li>
                    </ul>
                    <p className="mt-2 text-white/70 text-[11px]">Minimum 3-night stay required for discount.</p>
                  </span>
                </span>
              </span>
              <span>-{formatPrice(calculation.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-black/80">
            <span>Paystack Fee</span>
            <span>{formatPrice(PAYSTACK_FEE)}</span>
          </div>
          <div className="flex justify-between font-bold text-black pt-2 border-t border-black/10">
            <span>Your Price</span>
            <span>{formatPrice(calculation.total)}</span>
          </div>
        </div>
      )}

      {!bookingUrl && calculation && (
        <div className="space-y-3 mb-4">
          <div>
            <Label htmlFor="reservation-name" className="text-xs uppercase tracking-wide text-black/80">
              Full Name
            </Label>
            <Input
              id="reservation-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setPayError(null);
              }}
              className="mt-1 h-11 rounded-lg border-black/20"
              disabled={isRedirecting}
            />
          </div>
          <div>
            <Label htmlFor="reservation-email" className="text-xs uppercase tracking-wide text-black/80">
              Email Address
            </Label>
            <Input
              id="reservation-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setPayError(null);
              }}
              className="mt-1 h-11 rounded-lg border-black/20"
              disabled={isRedirecting}
            />
          </div>
          <div>
            <Label htmlFor="reservation-phone" className="text-xs uppercase tracking-wide text-black/80">
              Phone Number
            </Label>
            <Input
              id="reservation-phone"
              type="tel"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPayError(null);
              }}
              className="mt-1 h-11 rounded-lg border-black/20"
              disabled={isRedirecting}
            />
          </div>
        </div>
      )}

      {payError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {payError}
        </p>
      )}

      {bookingUrl ? (
        <Button
          asChild
          className="w-full h-12 rounded-lg text-base font-medium bg-[#5cfa74] hover:bg-[#bbfa5c] text-white"
          size="lg"
        >
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Apartment
          </a>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handlePaystackBook}
          disabled={isRedirecting || !calculation}
          className="w-full h-12 rounded-lg text-base font-medium bg-[#FA5C5C] hover:bg-[#E84A4A] text-white disabled:opacity-70"
          size="lg"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Redirecting to Paystack…
            </>
          ) : (
            "Book Apartment"
          )}
        </Button>
      )}
    </div>
  );
}
