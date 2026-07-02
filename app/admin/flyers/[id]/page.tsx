import Link from "next/link";
import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FlyerBuilder } from "@/components/admin/flyers/FlyerBuilder";
import { Button } from "@/components/ui/button";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function AdminFlyerEditPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="7xl">
                <AdminPageHeader
                    title="Edit flyer"
                    description="Live preview updates as you edit. Export print-ready PDF, PNG, or JPEG at 300 DPI."
                    actions={
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/flyers">← All flyers</Link>
                        </Button>
                    }
                />
                <FlyerBuilder flyerId={id} />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
