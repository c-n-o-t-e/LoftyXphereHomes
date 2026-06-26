"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

type PublicSiteChromeProps = {
    children: React.ReactNode;
};

export function PublicSiteChrome({ children }: PublicSiteChromeProps) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");

    return (
        <>
            {!isAdminRoute ? <Navbar /> : null}
            <main id="main-content" className="min-h-screen">
                {children}
            </main>
            {!isAdminRoute ? <Footer /> : null}
            {!isAdminRoute ? <WhatsAppFloatButton /> : null}
        </>
    );
}
