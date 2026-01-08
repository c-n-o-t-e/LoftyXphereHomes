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
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600 text-sm">+234 800 000 0000</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 text-sm">info@loftyxpherehomes.com</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
            <p className="text-gray-600 text-sm">430 Magnus Abe Street, Wuye, Abuja</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <ContactForm />
          </div>

          {/* Google Map */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Us</h2>
            <GoogleMap />
          </div>
        </div>
      </div>
    </div>
  );
}

