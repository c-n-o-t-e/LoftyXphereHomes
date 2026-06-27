"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { LandingHeader } from "@/components/landing/LandingHeader";

type PublicSiteChromeProps = {
    children: React.ReactNode;
};

export function PublicSiteChrome({ children }: PublicSiteChromeProps) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");
    const isLandingRoute = pathname === "/book";

    return (
        <>
            {isAdminRoute ? null : isLandingRoute ? <LandingHeader /> : <Navbar />}
            <main id="main-content" className="min-h-screen">
                {children}
            </main>
            {isAdminRoute || isLandingRoute ? null : <Footer />}
            {!isAdminRoute ? <WhatsAppFloatButton /> : null}
        </>
    );
}
