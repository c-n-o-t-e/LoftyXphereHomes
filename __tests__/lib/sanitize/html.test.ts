import { sanitizeBlogHtml } from "@/lib/sanitize/html";

describe("sanitizeBlogHtml", () => {
  it("preserves basic formatting tags", () => {
    const html = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeBlogHtml(html)).toContain("<p>");
    expect(sanitizeBlogHtml(html)).toContain("<strong>world</strong>");
  });

  it("strips script tags and event handlers", () => {
    const html =
      '<p onclick="alert(1)">Hi</p><script>alert("xss")</script>';
    const safe = sanitizeBlogHtml(html);
    expect(safe).not.toContain("<script");
    expect(safe).not.toContain("onclick");
    expect(safe).toContain("Hi");
  });

  it("blocks javascript: links", () => {
    const html = '<a href="javascript:alert(1)">click</a>';
    const safe = sanitizeBlogHtml(html);
    expect(safe).not.toContain("javascript:");
  });
});
