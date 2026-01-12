"use client";

import { motion } from "framer-motion";
import { STANDARD_AMENITIES } from "@/lib/constants";
import {
  Zap,
  Wifi,
  Wind,
  ChefHat,
  Car,
  Laptop,
  Tv,
  Shield,
  Sparkles,
} from "lucide-react";

const amenityIcons: Record<string, any> = {
  "24/7 Power": Zap,
  "High-speed Wi-Fi": Wifi,
  "Air Conditioning": Wind,
  "Fully equipped kitchen": ChefHat,
  "Secure parking": Car,
  "Workspace desk": Laptop,
  "Netflix/YouTube enabled TV": Tv,
  "Security personnel": Shield,
  "Fresh towels & toiletries": Sparkles,
};

export default function AmenitiesSection() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 px-2">
            Premium Amenities
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
            Every detail designed for your comfort and convenience
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {STANDARD_AMENITIES.map((amenity, index) => {
            const Icon = amenityIcons[amenity] || Sparkles;
            return (
              <motion.div
                key={amenity}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl hover:bg-black/5 transition-colors"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FA5C5C]/10 flex items-center justify-center mb-2 sm:mb-3">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#FA5C5C]" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-black leading-tight px-1">{amenity}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

