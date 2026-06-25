"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { VideoCompressTool } from "@/components/admin/VideoCompressTool";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminCompressVideoPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { data: me, isLoading: isMeLoading } = useAdminMe(
        Boolean(user) && !isLoading,
        user?.id,
    );

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login?redirect=/admin/compress-video");
        }
    }, [isLoading, user, router]);

    if (isLoading || isMeLoading || me === undefined) return null;
    if (!user) return null;

    if (!me.ok || me.role !== "admin") {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <Card className="p-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            Admin access required
                        </h1>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Video compressor
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Temporary tool — shrink large files so they fit the upload
                            limit, then publish via the normal admin video pages.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin">Back to admin</Link>
                    </Button>
                </div>
                <VideoCompressTool />
            </div>
        </div>
    );
}
