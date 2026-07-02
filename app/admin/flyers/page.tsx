import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FlyerListManager } from "@/components/admin/flyers/FlyerListManager";

export default function AdminFlyersPage() {
    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="5xl">
                <AdminPageHeader
                    title="Flyer Builder"
                    description="Create print-ready luxury marketing flyers for airports, hotels, restaurants, and corporate offices — no design software required."
                />
                <FlyerListManager />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
