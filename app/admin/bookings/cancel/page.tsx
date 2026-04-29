"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CancelResponse =
    | {
          ok: true;
          bookingId: string;
          invoiceId: string;
          alreadyCancelled?: boolean;
          sheetTitle?: string;
          rowNumber?: number;
          warning?: string;
          code?: string;
      }
    | { error: string; code?: string };

export default function AdminCancelBookingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [invoiceInput, setInvoiceInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<CancelResponse | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login?redirect=/admin/bookings/cancel");
        }
    }, [isLoading, user, router]);

    async function submit() {
        setError(null);
        setSuccess(null);
        setSubmitting(true);
        try {
            const supabase = getSupabaseClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session?.access_token) {
                router.push("/login?redirect=/admin/bookings/cancel");
                return;
            }

            const res = await fetch("/api/admin/bookings/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ invoiceId: invoiceInput.trim() }),
            });

            const payload = (await res.json()) as CancelResponse;
            if (!res.ok) {
                if ("error" in payload && typeof payload.error === "string") {
                    setError(payload.error);
                } else {
                    setError("Request failed.");
                }
                return;
            }
            if (!("ok" in payload) || payload.ok !== true) {
                setError("Unexpected server response.");
                return;
            }
            setSuccess(payload);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Request failed.");
        } finally {
            setSubmitting(false);
        }
    }

    if (isLoading) return null;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Cancel booking
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Marks the booking cancelled and sets{" "}
                            <span className="font-medium">Stayed</span> to false in Google
                            Sheets (strike-through styling applies on branded tabs).
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin">Back</Link>
                    </Button>
                </div>

                <Card className="p-6 mt-6">
                    <div>
                        <Label htmlFor="invoiceId">Invoice ID</Label>
                        <Input
                            id="invoiceId"
                            name="invoiceId"
                            className="mt-2 font-mono text-sm"
                            value={invoiceInput}
                            onChange={(e) => setInvoiceInput(e.target.value)}
                            placeholder="LXH-260414-7K3P9D or paste text that contains the id"
                            autoComplete="off"
                            disabled={submitting}
                            aria-describedby="invoice-hint"
                        />
                        <p
                            id="invoice-hint"
                            className="text-xs text-gray-500 mt-2"
                        >
                            You can paste the full id from the sheet or invoice PDF, or a
                            sentence that includes it.
                        </p>
                    </div>

                    {error && (
                        <div
                            className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3"
                            role="alert"
                        >
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && "ok" in success && success.ok && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                            <p className="text-sm text-green-800 font-medium">
                                {success.alreadyCancelled
                                    ? "This booking was already cancelled."
                                    : "Booking cancelled."}
                            </p>
                            <p className="text-xs text-green-900/80">
                                Booking ID: {success.bookingId} • Invoice:{" "}
                                {success.invoiceId}
                            </p>
                            {success.sheetTitle != null && success.rowNumber != null && (
                                <p className="text-xs text-green-900/80">
                                    Sheet: {success.sheetTitle}, row {success.rowNumber}
                                </p>
                            )}
                            {success.warning && (
                                <p className="text-sm text-amber-800 mt-2">
                                    {success.warning}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex gap-3 justify-end flex-wrap">
                        <Button variant="outline" asChild>
                            <Link href="/admin/bookings/new">New manual booking</Link>
                        </Button>
                        <Button
                            onClick={() => void submit()}
                            disabled={submitting || !invoiceInput.trim()}
                            variant="destructive"
                        >
                            {submitting ? "Cancelling…" : "Cancel booking"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
