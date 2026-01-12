import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group mb-4">
              <Image
                src="/Lofty Xphere logo transparent white (1).png"
                alt="LoftyXphereHomes Logo"
                width={400}
                height={133}
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                quality={100}
                sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, (max-width: 1024px) 48px, (max-width: 1280px) 56px, 56px"
              />
              <span className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl break-words">LoftyXphereHomes</span>
            </Link>
            <p className="text-sm sm:text-base leading-relaxed text-white/80 mb-4">
              Premium shortlet apartment rentals in Nigeria. Experience luxury, comfort, and exceptional service.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FA5C5C] transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FA5C5C] transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FA5C5C] transition-colors"
                aria-label="Twitter"
              >
                <SiX className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/apartments" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  All Apartments
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 mt-0.5 shrink-0 text-white/80" />
                <a href="tel:+2348000000000" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  +234 800 000 0000
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 mt-0.5 shrink-0 text-white/80" />
                <a href="mailto:info@loftyxpherehomes.com" className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80">
                  info@loftyxpherehomes.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-white/80" />
                <span className="text-sm sm:text-base text-white/80 break-words">430 Magnus Abe Street, Wuye, Abuja</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm text-white/80">
          <p>&copy; {currentYear} LoftyXphereHomes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

