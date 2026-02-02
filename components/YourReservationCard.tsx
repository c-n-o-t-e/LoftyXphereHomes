"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Users, Bed, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LAST_MINUTE_DISCOUNT_PERCENT,
  PAYSTACK_FEE,
} from "@/lib/constants";

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

  const calculation = useMemo(() => {
    if (!checkOut) return null;
    const inDate = parseLocalDate(checkIn);
    const outDate = parseLocalDate(checkOut);
    if (outDate <= inDate) return null;
    const nights = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = pricePerNight * nights;
    const daysUntilCheckIn = Math.ceil((inDate.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
    const hasLastMinuteDiscount = daysUntilCheckIn <= 7 && daysUntilCheckIn >= 0;
    const discountAmount = hasLastMinuteDiscount
      ? Math.round(subtotal * (LAST_MINUTE_DISCOUNT_PERCENT / 100))
      : 0;
    const afterDiscount = subtotal - discountAmount;
    const total = afterDiscount + PAYSTACK_FEE;
    return {
      nights,
      subtotal,
      discountAmount,
      hasLastMinuteDiscount,
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
          {calculation.hasLastMinuteDiscount && calculation.discountAmount > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Last minute discount</span>
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
          asChild
          className="w-full h-12 rounded-lg text-base font-medium bg-[#FA5C5C] hover:bg-[#E84A4A] text-white"
          size="lg"
        >
          <Link
            href={`/booking?apartment=${apartmentId}&checkIn=${checkIn}&checkOut=${checkOut}`}
          >
            Book Apartment
          </Link>
        </Button>
      )}
    </div>
  );
}
