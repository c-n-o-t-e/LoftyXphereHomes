"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield, Sparkles, Heart, Award, Check, Users, MapPin, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { AboutPageImages } from "@/lib/data/propertyAmenities";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import { SITE_NAME } from "@/lib/constants";
import { LOCATION_SEO, WHY_CHOOSE_HEADING } from "@/lib/content/seoCopy";

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
  { icon: Users, value: "4", label: "Bookable Luxury Suites" },
  { icon: MapPin, value: "Wuye", label: "Abuja, Nigeria" },
  { icon: Star, value: "4.8+", label: "Average Guest Rating" },
  { icon: Clock, value: "24/7", label: "Guest Support" },
];

type AboutPageContentProps = {
  images: AboutPageImages;
};

export function AboutPageContent({ images }: AboutPageContentProps) {
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
              About {SITE_NAME}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              A premium hospitality brand offering luxury serviced apartments and shortlet
              rentals in {LOCATION_SEO}.
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
              {images.story ? (
                <ResponsiveApartmentImage
                  image={images.story}
                  alt={images.story.altText ?? "Outdoor lounge and common areas at Lofty Xphere Homes"}
                  fill
                  variant="large"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-black/5" aria-hidden />
              )}
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
                  {SITE_NAME} was founded with a clear mission: to bring hotel-grade hospitality
                  to luxury serviced apartments in Nigeria. We recognised that business travellers,
                  remote workers, and leisure guests deserve more than a place to sleep — they deserve
                  a refined home away from home.
                </p>
                <p>
                  From our base in {LOCATION_SEO}, we curate each suite — Meridian, Lumen, Horizon,
                  Skyline, and more — to meet exacting standards for comfort, design, and service.
                  Every stay includes access to shared amenities including the pool, gym, bar, and
                  outdoor common areas.
                </p>
                <p>
                  What sets us apart is attentive, round-the-clock guest support. From booking to
                  checkout, our team is here to make your stay seamless, secure, and genuinely
                  memorable.
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
                {WHY_CHOOSE_HEADING}
              </h2>
              <p className="text-lg text-black/70 mb-8 leading-relaxed">
                We have built our reputation on luxury serviced apartments that combine privacy,
                style, and genuine hospitality in {LOCATION_SEO}. Here is what guests notice first:
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: "Named Luxury Suites",
                    description: "Meridian, Lumen, Horizon, and Skyline — each a fully serviced apartment with its own character.",
                  },
                  {
                    title: "Prime Wuye Location",
                    description: "Centrally located in Wuye, Abuja, with easy access to business districts and dining.",
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
              {images.whyChooseUs ? (
                <ResponsiveApartmentImage
                  image={images.whyChooseUs}
                  alt={images.whyChooseUs.altText ?? "Outdoor lounge and common areas at Lofty Xphere Homes"}
                  fill
                  variant="large"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-black/5" aria-hidden />
              )}
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
                To deliver exceptional stays that blend luxury serviced apartment living with
                warm, attentive hospitality — making every guest feel at home in Abuja.
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
                To become Nigeria&apos;s most trusted luxury serviced apartment brand — known for
                outstanding guest experiences, thoughtfully designed suites, and reliable service
                across Abuja and beyond.
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
              Ready to Experience {SITE_NAME}?
            </h2>
            <p className="text-lg md:text-xl text-black/70 mb-8 leading-relaxed">
              Browse our luxury serviced apartments in {LOCATION_SEO} and book your stay today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/apartments"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#FA5C5C] text-white rounded-full font-semibold hover:bg-[#E84A4A] transition-colors shadow-lg hover:shadow-xl"
              >
                View Apartments
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
