"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getApartmentById } from "@/lib/data/apartments";
import { ApartmentImageManager } from "@/components/admin/ApartmentImageManager";
import { ApartmentVideoManager } from "@/components/admin/ApartmentVideoManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminApartmentImagesPage() {
    const params = useParams<{ id: string }>();
    const apartmentId = params.id;
    const apartment = getApartmentById(apartmentId);

    if (!apartment) {
        return (
            <AdminOnlyGate>
                <AdminPageContainer maxWidth="3xl">
                    <Card className="border-slate-200/80 p-6 shadow-sm">
                        <h1 className="text-xl font-semibold text-slate-900">
                            Apartment not found
                        </h1>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/admin/apartments">Back to apartments</Link>
                        </Button>
                    </Card>
                </AdminPageContainer>
            </AdminOnlyGate>
        );
    }

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="6xl">
                <AdminPageHeader
                    title={apartment.name}
                    description="Apartment media — manage the tour video and gallery photos shown on the public listing."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/admin/apartments">All apartments</Link>
                        </Button>
                    }
                />

                <div className="space-y-8">
                    <ApartmentVideoManager
                        apartmentId={apartment.id}
                        apartmentName={apartment.name}
                    />
                    <ApartmentImageManager
                        apartmentId={apartment.id}
                        apartmentName={apartment.name}
                    />
                </div>
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
