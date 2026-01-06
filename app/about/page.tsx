import { Metadata } from "next";
import { Shield, Sparkles, Heart, Award } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about LoftyXphereHomes - your trusted partner for premium shortlet apartment rentals in Nigeria.",
};

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

export default function AboutPage() {
  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About LoftyXphereHomes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We&apos;re dedicated to providing premium shortlet apartment experiences
            that combine luxury, comfort, and exceptional service.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              LoftyXphereHomes was founded with a simple mission: to redefine the shortlet
              experience in Nigeria. We recognized that travelers, remote workers, and
              families deserve more than just a place to stay—they deserve a home away from home.
            </p>
            <p>
              Our carefully curated selection of apartments in prime locations across Lagos and
              Abuja offers the perfect blend of luxury, convenience, and affordability. Each
              property is handpicked and maintained to ensure our guests enjoy the highest
              standards of comfort and cleanliness.
            </p>
            <p>
              What sets us apart is our commitment to exceptional service. From the moment you
              book until you check out, our team is dedicated to making your stay memorable.
              We believe in going above and beyond to ensure every guest feels valued and cared for.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 text-white mb-4">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose LoftyXphereHomes?</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="mr-3 text-gray-900 font-bold">✓</span>
              <span>
                <strong>Premium Properties:</strong> Every apartment is carefully selected for
                quality, location, and amenities.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-gray-900 font-bold">✓</span>
              <span>
                <strong>Prime Locations:</strong> Strategically located in the best neighborhoods
                of Lagos and Abuja.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-gray-900 font-bold">✓</span>
              <span>
                <strong>24/7 Support:</strong> Our team is always available to assist with any
                questions or concerns.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-gray-900 font-bold">✓</span>
              <span>
                <strong>Clean & Safe:</strong> All properties are professionally cleaned and
                secured with 24/7 security personnel.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-gray-900 font-bold">✓</span>
              <span>
                <strong>Flexible Booking:</strong> Easy booking process with flexible check-in
                and check-out options.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-gray-900 font-bold">✓</span>
              <span>
                <strong>Guest Reviews:</strong> Consistently rated 4.8+ stars by our satisfied guests.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

