import { useQuery } from "@tanstack/react-query";
import type { BookingRange } from "@/lib/booking/checkoutDisabledDates";

export interface ApartmentAvailability {
  blockedDates?: string[];
  bookingRanges?: BookingRange[];
}

export function useApartmentAvailability(apartmentId: string) {
  return useQuery({
    queryKey: ["availability", apartmentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/availability?apartmentId=${encodeURIComponent(apartmentId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load availability");
      return res.json() as Promise<ApartmentAvailability>;
    },
    enabled: Boolean(apartmentId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
