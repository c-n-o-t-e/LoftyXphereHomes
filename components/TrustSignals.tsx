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
            Why Choose LoftyXphereHomes?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We&apos;re committed to providing you with an exceptional shortlet experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 text-white mb-4">
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

