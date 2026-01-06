import { Metadata } from "next";
import { apartments } from "@/lib/data/apartments";
import ApartmentCard from "@/components/ApartmentCard";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All Apartments",
  description: "Browse our complete collection of premium shortlet apartments in Lagos and Abuja, Nigeria.",
};

export default function ApartmentsPage() {
  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Apartments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of premium shortlet apartments across Nigeria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apartments.map((apartment, index) => (
            <ApartmentCard key={apartment.id} apartment={apartment} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

