import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { PostGeneratorClient } from "@/components/admin/PostGenerator/PostGeneratorClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function PostGeneratorEditorPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="full">
                <PostGeneratorClient key={id} templateId={id} />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
