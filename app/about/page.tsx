"use client";

import Image from "next/image";
import { Shield, Sparkles, Heart, Award, Check, Users, MapPin, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    icon: Shield,
    title: "Trust & Security",
    description: "We prioritize your safety and security with 24/7 support and verified properties.",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Every apartment is carefully selected and maintained to the highest standards.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Your comfort and satisfaction are at the heart of everything we do.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Consistently rated 4.8+ by our guests for exceptional service and experience.",
  },
];

const stats = [
  { icon: Users, value: "5,000+", label: "Happy Guests" },
  { icon: MapPin, value: "50+", label: "Premium Properties" },
  { icon: Star, value: "4.8", label: "Average Rating" },
  { icon: Clock, value: "24/7", label: "Support Available" },
];

export default function AboutPage() {
  return (
    <div className="pt-20 bg-white min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070"
            alt="Luxury apartment interior"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 px-2">
              About LoftyXphereHomes
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              Redefining luxury shortlet experiences in Nigeria with premium properties,
              exceptional service, and unforgettable stays.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-black/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FA5C5C]/10 text-[#FA5C5C] mb-3 sm:mb-4">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm md:text-base text-black/70 px-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section with Image */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070"
                alt="Modern luxury apartment living room"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6">Our Story</h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-black/80 leading-relaxed">
                <p>
                  LoftyXphereHomes was founded with a simple yet powerful mission: to redefine the
                  shortlet experience in Nigeria. We recognized that travelers, remote workers, and
                  families deserve more than just a place to stay—they deserve a home away from home
                  that exceeds expectations.
                </p>
                <p>
                  Our journey began with a vision to bridge the gap between luxury hospitality and
                  affordable accommodation. Located in the heart of Wuye, Abuja, we carefully curate
                  each property to ensure it meets our rigorous standards for quality, comfort, and style.
                </p>
                <p>
                  What sets us apart is our unwavering commitment to exceptional service. From the
                  moment you book until you check out, our dedicated team is here to make your stay
                  memorable. We believe in going above and beyond to ensure every guest feels
                  valued, cared for, and truly at home.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-black/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">Our Core Values</h2>
            <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
              The principles that guide everything we do
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-black/5"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FA5C5C] text-white mb-6">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-black/70 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section with Image */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Why Choose LoftyXphereHomes?
              </h2>
              <p className="text-lg text-black/70 mb-8 leading-relaxed">
                We&apos;ve built our reputation on delivering exceptional experiences that
                consistently exceed expectations. Here&apos;s what makes us different:
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: "Premium Properties",
                    description: "Every apartment is carefully selected for quality, location, and amenities.",
                  },
                  {
                    title: "Prime Locations",
                    description: "Strategically located in Wuye, Abuja, in the heart of the city.",
                  },
                  {
                    title: "24/7 Support",
                    description: "Our team is always available to assist with any questions or concerns.",
                  },
                  {
                    title: "Clean & Safe",
                    description: "All properties are professionally cleaned and secured with 24/7 security personnel.",
                  },
                  {
                    title: "Flexible Booking",
                    description: "Easy booking process with flexible check-in and check-out options.",
                  },
                  {
                    title: "Guest Reviews",
                    description: "Consistently rated 4.8+ stars by our satisfied guests.",
                  },
                ].map((item, index) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FA5C5C] flex items-center justify-center mt-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">{item.title}</h3>
                      <p className="text-black/70 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058"
                alt="Luxury apartment bedroom"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/10"
            >
              <div className="w-16 h-16 rounded-full bg-[#FA5C5C] flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                To provide exceptional shortlet experiences that combine luxury, comfort, and
                affordability. We strive to make every guest feel at home while delivering
                world-class hospitality standards that exceed expectations.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/10"
            >
              <div className="w-16 h-16 rounded-full bg-[#FA5C5C] flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                To become Nigeria&apos;s most trusted and preferred shortlet brand, recognized for
                our commitment to excellence, innovation, and guest satisfaction. We envision a
                future where every traveler in Nigeria has access to premium, affordable
                accommodation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to Experience LoftyXphereHomes?
            </h2>
            <p className="text-lg md:text-xl text-black/70 mb-8 leading-relaxed">
              Discover our premium apartments and book your perfect stay today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apartments"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#FA5C5C] text-white rounded-full font-semibold hover:bg-[#E84A4A] transition-colors shadow-lg hover:shadow-xl"
              >
                View Apartments
              </a>
              <a
                href="/booking"
                className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-black/80 transition-colors border-2 border-black"
              >
                Book Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
