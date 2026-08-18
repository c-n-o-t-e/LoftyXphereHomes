import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { ContentStudioClient } from "@/components/admin/ContentStudio/ContentStudioClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function ContentStudioEditorPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="full">
                <ContentStudioClient key={id} postId={id} />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
