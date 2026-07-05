import { buildStructuredDataGraph } from "@/lib/seo/structured-data";
import { getDefaultSocialShareImage } from "@/lib/seo/getDefaultSocialShareImage";

export async function StructuredData() {
  const socialShareImage = await getDefaultSocialShareImage();
  const graph = buildStructuredDataGraph({
    heroImageUrl: socialShareImage.url,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
