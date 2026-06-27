"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type UseAvailableApartmentsOptions = {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  enabled?: boolean;
};

export function useAvailableApartments({
  checkIn,
  checkOut,
  guests = 1,
  enabled = true,
}: UseAvailableApartmentsOptions) {
  const availabilityEnabled = enabled && !!(checkIn && checkOut);

  const {
    data: availabilityIds,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["apartments-available", checkIn, checkOut, guests],
    queryFn: async (): Promise<string[]> => {
      const params = new URLSearchParams();
      params.set("checkIn", checkIn!);
      params.set("checkOut", checkOut!);
      params.set("guests", guests.toString());
      const res = await fetch(`/api/apartments/available?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Availability is temporarily unavailable.";
        throw new Error(message);
      }
      return data.availableApartmentIds ?? [];
    },
    enabled: availabilityEnabled,
    staleTime: 60_000,
  });

  const isLoading = availabilityEnabled && isPending;

  const availableIds = useMemo(() => {
    if (!availabilityEnabled) return null;
    if (isLoading) return null;
    if (isError) return [];
    return availabilityIds ?? [];
  }, [availabilityEnabled, isLoading, isError, availabilityIds]);

  return {
    availableIds,
    isLoading,
    isError: availabilityEnabled && isError,
    error,
    refetch,
    isEnabled: availabilityEnabled,
  };
}
