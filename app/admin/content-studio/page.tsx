import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentStudioList } from "@/components/admin/ContentStudio/ContentStudioList";

export default function ContentStudioPage() {
    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="5xl">
                <AdminPageHeader
                    title="Content Studio"
                    description="Informational and lifestyle Instagram posts — editorial layouts, isolated visuals, and the LoftyXphereHomes brand system. The apartment showcase generator stays separate."
                />
                <ContentStudioList />
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
