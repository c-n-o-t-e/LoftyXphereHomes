import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostTemplateListManager } from "@/components/admin/PostGenerator/PostTemplateListManager";

export default function PostGeneratorPage() {
    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="5xl">
                <AdminPageHeader
                    title="Post Generator"
                    description="Create Instagram posts that match the approved luxury editorial layout — photo, cream panel, gold accents, amenities, and contact footer."
                />
                <PostTemplateListManager />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
