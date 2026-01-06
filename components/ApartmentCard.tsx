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
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {apartment.rating}
              </span>
            </div>
          </div>
        </Link>
        <CardContent className="p-6">
          <Link href={`/apartments/${apartment.id}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
              {apartment.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {apartment.shortDescription}
            </p>
          </Link>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {apartment.location.area}, {apartment.location.city}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
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

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(apartment.pricePerNight)}
                </p>
                <p className="text-xs text-gray-500">per night</p>
              </div>
              <Button asChild className="rounded-full">
                <Link href={`/apartments/${apartment.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

