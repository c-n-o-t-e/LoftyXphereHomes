import {
    adminImageProxyUrl,
    resolveCanvasImageRequest,
} from "@/lib/post-generator/canvasImageRequest";

describe("resolveCanvasImageRequest", () => {
    it("loads data and blob URLs directly without CORS", () => {
        expect(resolveCanvasImageRequest("data:image/jpeg;base64,xx")).toEqual({
            kind: "direct",
            src: "data:image/jpeg;base64,xx",
            useCors: false,
        });
        expect(resolveCanvasImageRequest("blob:http://localhost/abc")).toEqual({
            kind: "direct",
            src: "blob:http://localhost/abc",
            useCors: false,
        });
    });

    it("loads same-origin paths directly", () => {
        expect(resolveCanvasImageRequest("/uploads/cover.jpg")).toEqual({
            kind: "direct",
            src: "/uploads/cover.jpg",
            useCors: false,
        });
        expect(
            resolveCanvasImageRequest(
                "https://lofty.example/photo.jpg",
                "https://lofty.example",
            ),
        ).toEqual({
            kind: "direct",
            src: "https://lofty.example/photo.jpg",
            useCors: false,
        });
    });

    it("proxies remote Supabase suite covers through the admin image proxy", () => {
        const remote =
            "https://xyz.supabase.co/storage/v1/object/public/apartment-images/cover.jpg";
        expect(resolveCanvasImageRequest(remote, "http://localhost:3000")).toEqual({
            kind: "proxy",
            src: adminImageProxyUrl(remote),
            originalUrl: remote,
        });
        expect(adminImageProxyUrl(remote)).toContain(
            "/api/admin/flyers/image-proxy?url=",
        );
        expect(adminImageProxyUrl(remote)).toContain(encodeURIComponent(remote));
    });
});
