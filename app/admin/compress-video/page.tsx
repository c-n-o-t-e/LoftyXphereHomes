"use client";

import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VideoCompressTool } from "@/components/admin/VideoCompressTool";

export default function AdminCompressVideoPage() {
    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="3xl">
                <AdminPageHeader
                    title="Video compressor"
                    description="Prepare large video files before uploading them to the hero or apartment tour sections."
                />
                <VideoCompressTool />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
