"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Users, Bed, Bath, Star } from "lucide-react";
import { Apartment } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ApartmentCardProps {
  apartment: Apartment;
  index?: number;
}

export default function ApartmentCard({ apartment, index = 0 }: ApartmentCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
        <Link href={`/apartments/${apartment.id}`}>
          <div className="relative h-64 overflow-hidden">
            <Image
              src={apartment.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
              alt={apartment.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 border border-black/10">
              <Star className="h-4 w-4 fill-[#FA5C5C] text-[#FA5C5C]" />
              <span className="text-sm font-semibold text-black">
                {apartment.rating}
              </span>
            </div>
          </div>
        </Link>
        <CardContent className="p-6">
          <Link href={`/apartments/${apartment.id}`}>
            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-[#FA5C5C] transition-colors">
              {apartment.name}
            </h3>
            <p className="text-black/70 text-sm mb-4 line-clamp-2">
              {apartment.shortDescription}
            </p>
          </Link>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-black/70">
              <MapPin className="h-4 w-4 mr-2 text-[#FA5C5C]" />
              {apartment.location.area}, {apartment.location.city}
            </div>

            <div className="flex items-center space-x-4 text-sm text-black/70">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {apartment.capacity}
              </div>
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {apartment.beds}
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {apartment.baths}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-black/10 gap-3">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  {formatPrice(apartment.pricePerNight)}
                </p>
                <p className="text-xs text-black/60">per night</p>
              </div>
              <Button asChild className="rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white w-full sm:w-auto min-h-[44px] px-6 text-sm sm:text-base">
                <Link href={`/apartments/${apartment.id}`} className="w-full sm:w-auto text-center">View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

