"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Users, Search, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Resolver } from "react-hook-form";
import { areDatesValid } from "@/lib/utils/search";
import { DatePickerCalendar } from "./DatePickerCalendar";

const searchSchema = z
  .object({
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    guests: z.number().min(1, "At least 1 guest required").max(20, "Maximum 20 guests").optional(),
  })
  .refine(
    (data) => {
      if (data.checkIn && data.checkOut) {
        return areDatesValid(data.checkIn, data.checkOut);
      }
      return true;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    }
  );

type SearchFormData = {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function GuestCounter({
  label,
  sublabel,
  value,
  min,
  max,
  onIncrement,
  onDecrement,
}: {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 border-b border-black/10 last:border-b-0">
      <div>
        <p className="font-semibold text-black text-sm">{label}</p>
        {sublabel && <p className="text-xs text-black/50 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border border-black/20 flex items-center justify-center text-black/70 hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm font-medium text-black">{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={value >= max}
          className="w-9 h-9 rounded-full border border-black/20 flex items-center justify-center text-black/70 hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function HeroSearchBar() {
  const router = useRouter();
  const [openCalendar, setOpenCalendar] = useState<"checkIn" | "checkOut" | null>(null);
  const [openGuestPicker, setOpenGuestPicker] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const guestPickerRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema) as Resolver<SearchFormData>,
    defaultValues: {
      checkIn: "",
      checkOut: "",
      guests: 1,
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  const totalGuests = adults + children;

  useEffect(() => {
    setValue("guests", totalGuests);
  }, [adults, children, setValue, totalGuests]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (guestPickerRef.current && !guestPickerRef.current.contains(e.target as Node)) {
        setOpenGuestPicker(false);
      }
    };
    if (openGuestPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openGuestPicker]);

  const onSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams();
    if (data.checkIn) params.set("checkIn", data.checkIn);
    if (data.checkOut) params.set("checkOut", data.checkOut);
    if (data.guests) params.set("guests", data.guests.toString());
    router.push(`/apartments?${params.toString()}`);
  };

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const minCheckOut = checkIn
    ? (() => {
        const d = new Date(checkIn + "T12:00:00");
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
      })()
    : tomorrowStr;

  const handleCheckInSelect = (date: string) => {
    setValue("checkIn", date);
    setOpenCalendar(null);
    setValue("checkOut", "");
    setOpenCalendar("checkOut");
  };

  const handleCheckOutSelect = (date: string) => {
    setValue("checkOut", date);
    setOpenCalendar(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8 text-center space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm md:text-base text-white/80 font-light tracking-wide">
          Luxury Serviced Residences in Wuye, Abuja
        </p>
        {/* Mobile: 2x2 grid, Desktop: single row */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-x-4 sm:gap-y-2 text-[10px] sm:text-xs md:text-sm text-white/60 max-w-xs sm:max-w-none mx-auto">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#FA5C5C] rounded-full"></span>
            10 Units
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#FA5C5C] rounded-full"></span>
            Pool & Spa
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#FA5C5C] rounded-full"></span>
            Gym
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#FA5C5C] rounded-full"></span>
            Breakfast
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
            24/7 Power
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full shadow-2xl shadow-black/20 p-4 sm:p-5 md:py-2 md:px-3 flex flex-col md:flex-row gap-0 md:gap-0 items-stretch md:items-center md:w-fit mx-4 md:mx-auto border border-white/20"
      >
        {/* Mobile: Grid layout for dates, Desktop: inline */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-0 w-full md:w-auto">
          {/* Check-in Date */}
          <div className="relative md:w-40 md:flex-none border-r border-black/10 pr-3 md:pr-2 md:pl-2">
            <Label className="text-[10px] sm:text-xs font-semibold text-black/70 block uppercase tracking-wide">Check-in</Label>
            <button
              type="button"
              onClick={() => setOpenCalendar("checkIn")}
              className="w-full flex items-center justify-start gap-1.5 sm:gap-2 h-8 sm:h-10 md:h-10 rounded-md text-left text-black text-xs sm:text-sm bg-transparent hover:bg-black/5 focus:outline-none"
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/40 shrink-0" />
              <span className={`truncate ${checkIn ? "text-black" : "text-black/50"}`}>
                {checkIn ? formatDisplayDate(checkIn) : "Select"}
              </span>
            </button>
            {openCalendar === "checkIn" && (
              <DatePickerCalendar
                open
                onClose={() => setOpenCalendar(null)}
                value={checkIn ?? ""}
                minDate={today}
                onSelect={handleCheckInSelect}
                onClear={() => setValue("checkIn", "")}
                placement="top"
              />
            )}
            {errors.checkIn && (
              <p className="text-[10px] sm:text-xs text-[#FA5C5C] mt-0.5">{errors.checkIn.message}</p>
            )}
          </div>

          {/* Check-out Date */}
          <div className="relative md:w-40 md:flex-none md:border-r border-black/10 pl-3 md:px-2">
            <Label className="text-[10px] sm:text-xs font-semibold text-black/70 block uppercase tracking-wide">Check-out</Label>
            <button
              type="button"
              onClick={() => setOpenCalendar("checkOut")}
              className="w-full flex items-center justify-start gap-1.5 sm:gap-2 h-8 sm:h-10 md:h-10 rounded-md text-left text-black text-xs sm:text-sm bg-transparent hover:bg-black/5 focus:outline-none"
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/40 shrink-0" />
              <span className={`truncate ${checkOut ? "text-black" : "text-black/50"}`}>
                {checkOut ? formatDisplayDate(checkOut) : "Select"}
              </span>
            </button>
            {openCalendar === "checkOut" && (
              <DatePickerCalendar
                open
                onClose={() => setOpenCalendar(null)}
                value={checkOut ?? ""}
                minDate={minCheckOut}
                onSelect={handleCheckOutSelect}
                onClear={() => setValue("checkOut", "")}
                placement="top"
              />
            )}
            {errors.checkOut && (
              <p className="text-[10px] sm:text-xs text-[#FA5C5C] mt-0.5">{errors.checkOut.message}</p>
            )}
          </div>
        </div>

        {/* Divider for mobile */}
        <div className="h-px bg-black/10 my-3 md:hidden"></div>

        {/* Guests + Search row on mobile */}
        <div className="flex items-center gap-3 md:contents">
          {/* Guests */}
          <div className="relative flex-1 md:w-36 md:flex-none md:border-r border-black/10 md:px-2" ref={guestPickerRef}>
            <Label className="text-[10px] sm:text-xs font-semibold text-black/70 block uppercase tracking-wide">
              Guests
            </Label>
            <button
              type="button"
              onClick={() => {
                setOpenCalendar(null);
                setOpenGuestPicker(!openGuestPicker);
              }}
              className="w-full flex items-center justify-start gap-2 h-8 sm:h-10 md:h-10 rounded-md text-left text-black text-xs sm:text-sm bg-transparent hover:bg-black/5 focus:outline-none"
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/40 shrink-0" />
              <span className="text-black truncate">
                {adults} adult{adults !== 1 ? "s" : ""}
                {children > 0 ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""}
              </span>
            </button>

            {openGuestPicker && (
              <div className="absolute bottom-full left-0 mb-1 w-80 max-w-[calc(100vw-2rem)] p-4 bg-white rounded-2xl shadow-xl border border-black/10 z-50 md:bottom-auto md:top-full md:mb-0 md:mt-1">
                <GuestCounter
                  label="Adults"
                  sublabel="Age 13+"
                  value={adults}
                  min={1}
                  max={20}
                  onIncrement={() => setAdults((a) => Math.min(20, a + 1))}
                  onDecrement={() => setAdults((a) => Math.max(1, a - 1))}
                />
                <GuestCounter
                  label="Children"
                  sublabel="Ages 2-12"
                  value={children}
                  min={0}
                  max={20}
                  onIncrement={() => setChildren((c) => Math.min(20, c + 1))}
                  onDecrement={() => setChildren((c) => Math.max(0, c - 1))}
                />
              </div>
            )}

            {errors.guests && (
              <p className="text-[10px] sm:text-xs text-[#FA5C5C] mt-0.5">{errors.guests.message}</p>
            )}
          </div>

          {/* Search Button */}
          <div className="md:ml-2">
            <Button
              type="submit"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl"
              aria-label="Search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
