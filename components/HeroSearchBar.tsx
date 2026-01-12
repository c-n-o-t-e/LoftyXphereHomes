"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { areDatesValid } from "@/lib/utils/search";

const searchSchema = z
  .object({
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    guests: z.coerce.number().min(1, "At least 1 guest required").max(20, "Maximum 20 guests").optional(),
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

type SearchFormData = z.infer<typeof searchSchema>;

export default function HeroSearchBar() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      checkIn: "",
      checkOut: "",
      guests: 2,
    },
  });

  const onSubmit = (data: SearchFormData) => {
    // Build search params
    const params = new URLSearchParams();
    
    if (data.checkIn) params.set("checkIn", data.checkIn);
    if (data.checkOut) params.set("checkOut", data.checkOut);
    if (data.guests) params.set("guests", data.guests.toString());

    // Navigate to apartments page with search params
    router.push(`/apartments?${params.toString()}`);
  };

  // Get minimum dates (today for check-in, tomorrow for check-out)
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Trust Banner */}
      <div className="mb-5 text-center">
        <p className="text-sm md:text-base text-white/95 font-semibold tracking-wider uppercase">
          GREAT LOCATIONS | TOP RATED HOST | PREMIUM AMENITIES
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4 md:py-1.5 md:pl-2 md:pr-2 flex flex-col md:flex-row gap-3 md:gap-0 items-stretch md:items-center md:w-fit md:mx-auto"
      >
        {/* Check-in Date */}
        <div className="md:w-40 md:flex-none flex-1 md:border-r border-black/10 md:pr-2 md:pl-2">
          <Label
            htmlFor="checkIn"
            className="text-xs font-semibold text-black/70 block"
          >
            Arrive
          </Label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            <Input
              id="checkIn"
              type="date"
              min={today}
              className="pl-7 h-10 sm:h-12 md:h-10 border-0 shadow-none focus:ring-0 text-black text-sm"
              {...register("checkIn")}
              onChange={(e) => {
                setValue("checkIn", e.target.value);
                // Auto-set minimum check-out date to day after check-in
                if (e.target.value) {
                  const checkInDate = new Date(e.target.value);
                  checkInDate.setDate(checkInDate.getDate() + 1);
                  const minCheckOut = checkInDate.toISOString().split("T")[0];
                  setValue("checkOut", minCheckOut);
                }
              }}
            />
          </div>
          {errors.checkIn && (
            <p className="text-xs text-[#FA5C5C] mt-1">{errors.checkIn.message}</p>
          )}
        </div>

        {/* Check-out Date */}
        <div className="md:w-40 md:flex-none flex-1 md:border-r border-black/10 md:px-2">
          <Label
            htmlFor="checkOut"
            className="text-xs font-semibold text-black/70 block"
          >
            Depart
          </Label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            <Input
              id="checkOut"
              type="date"
              min={watch("checkIn") || tomorrowStr}
              className="pl-7 h-10 sm:h-12 md:h-10 border-0 shadow-none focus:ring-0 text-black text-sm"
              {...register("checkOut")}
            />
          </div>
          {errors.checkOut && (
            <p className="text-xs text-[#FA5C5C] mt-1">{errors.checkOut.message}</p>
          )}
        </div>

        {/* Guests */}
        <div className="md:w-32 md:flex-none flex-1 md:border-r border-black/10 md:px-2">
          <Label
            htmlFor="guests"
            className="text-xs font-semibold text-black/70 block"
          >
            Guests
          </Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            <Input
              id="guests"
              type="number"
              min="1"
              max="20"
              className="pl-10 h-10 sm:h-12 md:h-10 border-0 shadow-none focus:ring-0 text-black text-sm text-center"
              {...register("guests")}
            />
          </div>
          {errors.guests && (
            <p className="text-xs text-[#FA5C5C] mt-1">{errors.guests.message}</p>
          )}
        </div>

        {/* Search Button */}
        <div className="md:w-auto w-full md:ml-2 md:mr-0 flex items-end md:items-center">
          <Button
            type="submit"
            className="w-full md:w-12 md:h-12 h-10 sm:h-12 rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl min-h-[40px] md:min-h-[48px] md:min-w-[48px]"
            aria-label="Search"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

