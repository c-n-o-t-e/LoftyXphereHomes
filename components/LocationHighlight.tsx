"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const locations = [
  { city: "Lagos", area: "Victoria Island, Lekki, Ikoyi", count: 3 },
  { city: "Abuja", area: "Wuse 2, Maitama, Garki", count: 3 },
];

export default function LocationHighlight() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Prime Locations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Strategically located in Nigeria&apos;s most desirable neighborhoods
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {locations.map((location, index) => (
            <motion.div
              key={location.city}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {location.city}
                  </h3>
                  <p className="text-gray-600">{location.area}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                {location.count} premium apartments available
              </p>
              <Button asChild variant="outline" className="rounded-full w-full">
                <Link href={`/apartments?city=${location.city.toLowerCase()}`}>
                  View {location.city} Apartments
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

