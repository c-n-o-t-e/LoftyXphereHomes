"use client";

import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SiteImageSlotManager } from "@/components/admin/SiteImageSlotManager";

export default function AdminSiteImagesPage() {
    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="4xl">
                <AdminPageHeader
                    title="Site images"
                    description="Choose which amenity gallery photos appear on the Experience and About pages — no code changes needed."
                />
                <SiteImageSlotManager />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
