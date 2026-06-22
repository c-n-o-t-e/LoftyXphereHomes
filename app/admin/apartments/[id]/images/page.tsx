"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAdminMe } from "@/hooks/useAdminMe";
import { getApartmentById } from "@/lib/data/apartments";
import { ApartmentImageManager } from "@/components/admin/ApartmentImageManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminApartmentImagesPage() {
    const params = useParams<{ id: string }>();
    const apartmentId = params.id;
    const apartment = getApartmentById(apartmentId);
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { data: me, isLoading: isMeLoading } = useAdminMe(
        Boolean(user) && !isLoading,
        user?.id,
    );

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push(`/login?redirect=/admin/apartments/${apartmentId}/images`);
        }
    }, [isLoading, user, router, apartmentId]);

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

    if (!apartment) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <Card className="p-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            Apartment not found
                        </h1>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/admin/apartments">Back to apartments</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
                    <div>
                        <p className="text-sm text-gray-500">Apartment images</p>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {apartment.name}
                        </h1>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/apartments">All apartments</Link>
                    </Button>
                </div>

                <ApartmentImageManager
                    apartmentId={apartment.id}
                    apartmentName={apartment.name}
                />
            </div>
        </div>
    );
}
