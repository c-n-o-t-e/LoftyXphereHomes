import { sendResendEmail } from "@/lib/email/resendSend";

describe("sendResendEmail", () => {
    const savedKey = process.env.RESEND_API_KEY;

    afterEach(() => {
        if (savedKey === undefined) {
            delete process.env.RESEND_API_KEY;
        } else {
            process.env.RESEND_API_KEY = savedKey;
        }
        jest.restoreAllMocks();
    });

    it("returns false when RESEND_API_KEY is missing", async () => {
        delete process.env.RESEND_API_KEY;
        const fetchSpy = jest.spyOn(global, "fetch");
        const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        const ok = await sendResendEmail({
            from: "Test <test@example.com>",
            to: ["a@example.com"],
            subject: "Hi",
            text: "Body",
        });
        expect(ok).toBe(false);
        expect(fetchSpy).not.toHaveBeenCalled();
        errSpy.mockRestore();
    });

    it("posts to Resend and returns true on 200", async () => {
        process.env.RESEND_API_KEY = "re_test";
        jest.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ id: "mock" }),
        } as any);

        const ok = await sendResendEmail({
            from: "Test <test@example.com>",
            to: ["a@example.com"],
            subject: "Hi",
            text: "Body",
            attachments: [
                {
                    filename: "x.pdf",
                    content: Buffer.from("pdf"),
                },
            ],
        });

        expect(ok).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
            "https://api.resend.com/emails",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    Authorization: "Bearer re_test",
                }),
            }),
        );
        const [, init] = (fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse((init as RequestInit).body as string);
        expect(body.attachments[0].content).toBe(
            Buffer.from("pdf").toString("base64"),
        );
    });
});
