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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Premium Amenities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every detail designed for your comfort and convenience
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {STANDARD_AMENITIES.map((amenity, index) => {
            const Icon = amenityIcons[amenity] || Sparkles;
            return (
              <motion.div
                key={amenity}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Icon className="h-8 w-8 text-gray-700" />
                </div>
                <p className="text-sm font-medium text-gray-900">{amenity}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

