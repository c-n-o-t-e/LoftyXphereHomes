"use client";

import { Metadata } from "next";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { apartments } from "@/lib/data/apartments";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);

  // Collect all images from all apartments
  const allImages = apartments.flatMap((apt) =>
    apt.images.map((img) => ({
      src: img,
      apartment: apt.name,
      apartmentId: apt.id,
    }))
  );

  const handleImageClick = (image: string, apartmentId: string) => {
    setSelectedImage(image);
    setSelectedApartment(apartmentId);
  };

  return (
    <>
      <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 pt-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Gallery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our premium apartments through stunning visuals
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {allImages.map((item, index) => (
              <motion.div
                key={`${item.apartmentId}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="break-inside-avoid mb-4 cursor-pointer group"
                onClick={() => handleImageClick(item.src, item.apartmentId)}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.src}
                      alt={`${item.apartment} - Image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      {item.apartment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-0" showCloseButton={false}>
          <DialogTitle className="sr-only">
            {selectedImage && selectedApartment
              ? `Gallery image from ${apartments.find((apt) => apt.id === selectedApartment)?.name || "apartment"}`
              : "Gallery image"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Viewing a gallery image in full size. Use the close button to return to the gallery.
          </DialogDescription>
          {selectedImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage}
                alt={
                  selectedApartment
                    ? `Gallery image from ${apartments.find((apt) => apt.id === selectedApartment)?.name || "apartment"}`
                    : "Gallery image"
                }
                fill
                className="object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

