"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  YourReservationCard,
  type YourReservationCardProps,
} from "@/components/YourReservationCard";
import { areDatesValid } from "@/lib/utils/search";

type ReservationCardFromUrlProps = Omit<
  YourReservationCardProps,
  "initialCheckIn" | "initialCheckOut"
>;

function ReservationCardWithUrlDates(props: ReservationCardFromUrlProps) {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const hasValidDates =
    !!checkIn && !!checkOut && areDatesValid(checkIn, checkOut);

  return (
    <YourReservationCard
      {...props}
      initialCheckIn={hasValidDates ? checkIn : undefined}
      initialCheckOut={hasValidDates ? checkOut : undefined}
    />
  );
}

/** Reads checkIn/checkOut from the URL and pre-fills the reservation widget. */
export function YourReservationCardFromUrl(props: ReservationCardFromUrlProps) {
  return (
    <Suspense fallback={<YourReservationCard {...props} />}>
      <ReservationCardWithUrlDates {...props} />
    </Suspense>
  );
}
