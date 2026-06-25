"use client";

import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getStayDiscountTiers } from "@/lib/pricing";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

interface StayDiscountPromoProps {
  rackRateNgn: number;
  className?: string;
}

export function StayDiscountPromo({
  rackRateNgn,
  className = "",
}: StayDiscountPromoProps) {
  const tiers = getStayDiscountTiers(rackRateNgn);

  return (
    <Dialog>
      <div
        className={`rounded-xl border border-[#FA5C5C]/25 bg-gradient-to-r from-[#FA5C5C]/8 to-transparent p-3.5 ${className}`}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FA5C5C]/15 text-[#FA5C5C]"
            aria-hidden
          >
            <Tag className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-black">
              Save more when you stay longer
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-black/65">
              Nightly rates drop from {formatPrice(rackRateNgn)} for short stays
              to as low as{" "}
              <strong className="text-black">
                {formatPrice(tiers[tiers.length - 1]?.effectiveNightlyRateNgn ?? rackRateNgn)}
                /night
              </strong>{" "}
              on month-long bookings.
            </p>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="link"
                className="mt-1 h-auto p-0 text-xs font-semibold text-[#FA5C5C] hover:text-[#E84A4A]"
              >
                View discount rates →
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </div>

      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Length-of-stay discounts</DialogTitle>
          <DialogDescription>
            The longer you stay, the lower your nightly rate. Discounts apply
            automatically when you select your dates.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-xl border border-black/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black text-left text-xs uppercase tracking-wide text-white">
                <th className="px-3 py-2.5 font-semibold">Stay length</th>
                <th className="px-3 py-2.5 font-semibold text-right">
                  Nightly rate
                </th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr
                  key={tier.label}
                  className="border-t border-black/8 even:bg-black/[0.02]"
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-black">{tier.label}</p>
                    <p className="text-xs text-black/55">{tier.nightsHint}</p>
                    {tier.savingsPerNightNgn > 0 && (
                      <p className="mt-0.5 text-xs font-medium text-[#FA5C5C]">
                        Save {formatPrice(tier.savingsPerNightNgn)}/night
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-black">
                    {formatPrice(tier.effectiveNightlyRateNgn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-black/55">
          Rack rate: {formatPrice(rackRateNgn)}/night for a single night. Rates
          above are per night for the full stay at that tier.
        </p>
      </DialogContent>
    </Dialog>
  );
}
