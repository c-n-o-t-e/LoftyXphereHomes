import { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import GoogleMap from "@/components/GoogleMap";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with LoftyXphereHomes. We're here to help with bookings, inquiries, and support.",
};

export default function ContactPage() {
  return (
    <div className="pt-20 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16 pt-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center border border-black/10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FA5C5C] text-white flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="font-semibold text-black mb-2 text-base sm:text-lg">Phone</h3>
            <p className="text-black/70 text-sm sm:text-base break-all">+234 800 000 0000</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center border border-black/10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FA5C5C] text-white flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="font-semibold text-black mb-2 text-base sm:text-lg">Email</h3>
            <p className="text-black/70 text-sm sm:text-base break-all">info@loftyxpherehomes.com</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center border border-black/10 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FA5C5C] text-white flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="font-semibold text-black mb-2 text-base sm:text-lg">Location</h3>
            <p className="text-black/70 text-sm sm:text-base break-words px-2">430 Magnus Abe Street, Wuye, Abuja</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-black/10">
            <h2 className="text-2xl font-bold text-black mb-6">Send us a Message</h2>
            <ContactForm />
          </div>

          {/* Google Map */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-black/10">
            <h2 className="text-2xl font-bold text-black mb-6">Find Us</h2>
            <GoogleMap />
          </div>
        </div>
      </div>
    </div>
  );
}

