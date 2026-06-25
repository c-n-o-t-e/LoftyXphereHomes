"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackPhoneCallClick } from "@/lib/analytics/conversions";

type TrackedPhoneLinkProps = ComponentPropsWithoutRef<"a"> & {
  trackingLabel: string;
};

export function TrackedPhoneLink({
  trackingLabel,
  onClick,
  ...props
}: TrackedPhoneLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackPhoneCallClick({
          label: trackingLabel,
          category: "engagement",
        });
        onClick?.(event);
      }}
    />
  );
}
