"use client";

import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HeroVideoManager } from "@/components/admin/HeroVideoManager";

export default function AdminHeroVideoPage() {
    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="3xl">
                <AdminPageHeader
                    title="Hero video"
                    description="Manage the homepage hero loop. Only optimized variants are stored — not the original upload."
                />
                <HeroVideoManager />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
