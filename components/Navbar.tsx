"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import HeroSearchBar from "./HeroSearchBar";

export default function Navbar() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchBarNav, setShowSearchBarNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      if (isHome) {
        const heroThreshold = window.innerHeight * 0.7;
        setShowSearchBarNav(scrollY > heroThreshold);
      } else {
        setShowSearchBarNav(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/apartments", label: "Apartments" },
    { href: "/blog", label: "Blog" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  const isSearchMode = isHome && showSearchBarNav;

  const navBgClasses = isSearchMode
    ? "bg-white shadow-sm"
    : isHome
      ? "bg-transparent hover:bg-white/80 hover:backdrop-blur-md"
      : isScrolled
        ? "bg-white/70 backdrop-blur-md shadow-sm"
        : "bg-white/60 backdrop-blur-sm";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 overflow-visible ${navBgClasses}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isSearchMode ? (
          <div className="py-2 relative">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <HeroSearchBar variant="nav" />
              </div>

              {/* Hamburger menu (when search bar replaces nav) */}
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full border border-black/10 bg-white hover:bg-black/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                )}
              </button>
            </div>

            {/* Desktop dropdown (reuses the same links as mobile menu) */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="hidden md:block absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white shadow-xl border border-black/10 overflow-hidden"
                >
                  <div className="py-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-black hover:text-[#FA5C5C] font-medium py-3 px-4 text-sm transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}

                    <div className="border-t border-black/10 my-1" />

                    {!authLoading && (
                      user ? (
                        <div className="py-1">
                          <Link
                            href="/my-bookings"
                            className="flex items-center gap-2 text-black hover:text-[#FA5C5C] font-medium py-3 px-4 text-sm transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            My Bookings
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              signOut();
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left text-gray-600 hover:text-[#FA5C5C] font-medium py-3 px-4 text-sm transition-colors flex items-center gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <Link
                          href="/login"
                          className="block text-black hover:text-[#FA5C5C] font-medium py-3 px-4 text-sm transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                      )
                    )}

                    <div className="p-3 pt-2">
                      <Button
                        asChild
                        className="w-full rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white"
                      >
                        <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile dropdown (search mode) */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mt-2 bg-white border border-black/10 rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="py-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center text-black hover:text-[#FA5C5C] font-medium py-3 px-4 text-base transition-colors min-h-[44px]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}

                    <div className="border-t border-black/10 my-1" />

                    {!authLoading && (
                      user ? (
                        <>
                          <Link
                            href="/my-bookings"
                            className="flex items-center gap-2 text-black hover:text-[#FA5C5C] font-medium py-3 px-4 text-base transition-colors min-h-[44px]"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="h-5 w-5" />
                            My Bookings
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              signOut();
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left text-gray-600 hover:text-[#FA5C5C] font-medium py-3 px-4 text-base transition-colors min-h-[44px] flex items-center gap-2"
                          >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/login"
                          className="flex items-center text-black hover:text-[#FA5C5C] font-medium py-3 px-4 text-base transition-colors min-h-[44px]"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                      )
                    )}

                    <div className="p-3 pt-2">
                      <Button
                        asChild
                        className="w-full rounded-full py-4 text-base font-semibold bg-[#FA5C5C] hover:bg-[#E84A4A] text-white min-h-[48px]"
                      >
                        <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
        <div className="flex items-center justify-between h-20 overflow-visible">
          <Link href="/" className="flex items-center group -my-2 sm:-my-3 md:-my-4 lg:-my-5">
            <Image
              src="/Lofty Xphere logo transparent black (1).png"
              alt="LoftyXphereHomes Logo"
              width={600}
              height={200}
              className="h-20 sm:h-24 md:h-32 lg:h-36 xl:h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
              quality={100}
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 256px, (max-width: 1280px) 288px, 320px"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-black hover:text-[#FA5C5C] font-medium transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
            {!authLoading && (
              user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/my-bookings"
                    className="text-black hover:text-[#FA5C5C] font-medium transition-colors text-sm flex items-center gap-1.5"
                  >
                    <User className="h-4 w-4" />
                    My Bookings
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-gray-500 hover:text-[#FA5C5C] transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-black hover:text-[#FA5C5C] font-medium transition-colors text-sm"
                >
                  Login
                </Link>
              )
            )}
            <Button asChild className="rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white">
              <Link href="/booking">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button - Larger touch target */}
          <button
            className="md:hidden p-3 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        )}
      </div>

      {/* Mobile Menu (only show when regular nav is visible) */}
      {!isSearchMode && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="container mx-auto px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center text-black hover:text-[#FA5C5C] font-medium py-3 px-2 text-base transition-colors min-h-[44px]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {!authLoading && (
                  user ? (
                    <>
                      <Link
                        href="/my-bookings"
                        className="text-black hover:text-[#FA5C5C] font-medium py-3 px-2 text-base transition-colors min-h-[44px] flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        My Bookings
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left text-gray-500 hover:text-[#FA5C5C] font-medium py-3 px-2 text-base transition-colors min-h-[44px] flex items-center gap-2"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="text-black hover:text-[#FA5C5C] font-medium py-3 px-2 text-base transition-colors min-h-[44px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )
                )}
                <div className="pt-2">
                  <Button asChild className="w-full rounded-full py-4 text-base font-semibold bg-[#FA5C5C] hover:bg-[#E84A4A] text-white min-h-[48px]">
                    <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.nav>
  );
}

