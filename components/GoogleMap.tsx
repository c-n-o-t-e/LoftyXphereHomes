"use client";

import { MapPin } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { SITE_ADDRESS_FULL } from "@/lib/seo/constants";

export default function GoogleMap() {
  // Using Google Maps embed URL (no API key required for basic embed)
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(SITE_ADDRESS_FULL)}&output=embed`;

  return (
    <div className="w-full">
      <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg mb-4">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${SITE_NAME} — ${SITE_ADDRESS_FULL}`}
          className="w-full h-full"
        />
      </div>
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">Our Location</p>
            <p className="text-sm text-gray-600 mb-3">{SITE_ADDRESS_FULL}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_ADDRESS_FULL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors"
            >
              Open in Google Maps
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
