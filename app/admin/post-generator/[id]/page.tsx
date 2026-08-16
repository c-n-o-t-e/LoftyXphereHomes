import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostGeneratorClient } from "@/components/admin/PostGenerator/PostGeneratorClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function PostGeneratorEditorPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="6xl">
                <AdminPageHeader
                    title="Edit Instagram post"
                    description="Live 4:5 preview on top. Every control below updates the canvas instantly."
                />
                {/* Remount per route id so editor state cannot leak across templates. */}
                <PostGeneratorClient key={id} templateId={id} />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
