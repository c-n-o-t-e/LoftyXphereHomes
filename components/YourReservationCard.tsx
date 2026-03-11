"use client";

import { useState, useMemo } from "react";
import { Calendar, Users, Bed, Bath, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStayDiscountAmount, PAYSTACK_FEE } from "@/lib/constants";

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

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  const handlePaystackBook = async () => {
    setPayError(null);
    if (!calculation) {
      setPayError("Please select check-in and check-out dates.");
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
    setIsRedirecting(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
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
        <div>
          <Label htmlFor="check-in" className="text-xs uppercase tracking-wide text-black/80">
            Check-in
          </Label>
          <div className="relative mt-1">
            <Input
              id="check-in"
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut("");
              }}
              className="pr-10 h-11 rounded-lg border-black/20"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
          </div>
        </div>
        <div>
          <Label htmlFor="check-out" className="text-xs uppercase tracking-wide text-black/80">
            Check-out
          </Label>
          <div className="relative mt-1">
            <Input
              id="check-out"
              type="date"
              value={checkOut}
              min={minCheckOut}
              onChange={(e) => {
                const value = e.target.value;
                if (value && value <= checkIn) return;
                setCheckOut(value);
              }}
              className="pr-10 h-11 rounded-lg border-black/20"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
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
                  <Info className="h-4 w-4 text-black/40 cursor-help shrink-0" aria-label="Discount breakdown" title="Stay longer, save more: discount applied to your nightly rate." />
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
        <div className="mb-4">
          <Label htmlFor="reservation-email" className="text-xs uppercase tracking-wide text-black/80">
            Name for reservation
          </Label>
          <Input
            id="reservation-name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              // setPayError(null); 
            }}
            className="mt-1 h-11 rounded-lg border-black/20"
            disabled={isRedirecting}
          />
          <Label htmlFor="reservation-email" className="text-xs uppercase tracking-wide text-black/80">
            Email for payment receipt
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
