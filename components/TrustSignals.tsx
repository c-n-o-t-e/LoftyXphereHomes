"use client";

import { Shield, Sparkles, Wifi, Headphones, Star } from "lucide-react";
import { motion } from "framer-motion";

const trustItems = [
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "24/7 security personnel and secure parking",
  },
  {
    icon: Sparkles,
    title: "Premium Clean",
    description: "Immaculate spaces maintained to the highest standards",
  },
  {
    icon: Wifi,
    title: "High-Speed Wi-Fi",
    description: "Reliable internet for work and entertainment",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always available to assist with your needs",
  },
  {
    icon: Star,
    title: "Rated 4.8+",
    description: "Consistently excellent reviews from our guests",
  },
];

export default function TrustSignals() {
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
            Why Choose LoftyXphereHomes?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
            We&apos;re committed to providing you with an exceptional shortlet experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-4 sm:p-6 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FA5C5C] text-white mb-3 sm:mb-4">
                <item.icon className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="font-semibold text-black mb-2 text-sm sm:text-base">{item.title}</h3>
              <p className="text-xs sm:text-sm text-black/70 px-1">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

