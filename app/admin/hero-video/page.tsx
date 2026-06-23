"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { HeroVideoManager } from "@/components/admin/HeroVideoManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminHeroVideoPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { data: me, isLoading: isMeLoading } = useAdminMe(
        Boolean(user) && !isLoading,
        user?.id,
    );

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login?redirect=/admin/hero-video");
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
                        <h1 className="text-2xl font-bold text-gray-900">Hero video</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage the homepage hero loop. Only optimized variants are stored
                            — not the original upload.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin">Back to admin</Link>
                    </Button>
                </div>
                <HeroVideoManager />
            </div>
        </div>
    );
}
