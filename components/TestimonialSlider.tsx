"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/lib/data/testimonials";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function TestimonialSlider() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6">
            What Our Guests Say
          </h2>
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t just take our word for it - hear from our satisfied guests
          </p>
        </motion.div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col border border-black/10"
                >
                  <Quote className="h-8 w-8 text-[#FA5C5C]/30 mb-4" />
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "fill-[#FA5C5C] text-[#FA5C5C]"
                            : "text-black/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-black/80 mb-4 grow leading-relaxed">
                    &quot;{testimonial.comment}&quot;
                  </p>
                  <div className="border-t border-black/10 pt-4">
                    <p className="font-semibold text-black">{testimonial.name}</p>
                    <p className="text-sm text-black/60">
                      {testimonial.location} • {testimonial.date}
                    </p>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}

