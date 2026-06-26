"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    const [invoiceInput, setInvoiceInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<CancelResponse | null>(null);

    async function submit() {
        setError(null);
        setSuccess(null);
        setSubmitting(true);
        try {
            const supabase = getSupabaseClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) {
                setError("Not signed in.");
                return;
            }

            const res = await fetch("/api/admin/bookings/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ invoiceId: invoiceInput.trim() }),
            });

            const payload = (await res.json()) as CancelResponse;
            if (!res.ok) {
                setError("error" in payload ? payload.error : "Request failed.");
                return;
            }
            setSuccess(payload);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Request failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="3xl">
                <AdminPageHeader
                    title="Cancel booking"
                    description='Marks the booking cancelled and sets Stayed to false in Google Sheets (strike-through styling applies on branded tabs).'
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/admin/bookings">View bookings</Link>
                        </Button>
                    }
                />

                <Card className="border-slate-200/80 p-6 shadow-sm">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="invoice-id">Invoice ID</Label>
                            <Input
                                id="invoice-id"
                                value={invoiceInput}
                                onChange={(e) => setInvoiceInput(e.target.value)}
                                placeholder="e.g. LXH-2026-00042"
                            />
                        </div>

                        {error ? (
                            <p className="text-sm text-red-700" role="alert">
                                {error}
                            </p>
                        ) : null}

                        {success && "ok" in success && success.ok ? (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                                <p className="font-medium">
                                    {success.alreadyCancelled
                                        ? "Booking was already cancelled."
                                        : "Booking cancelled."}
                                </p>
                                <p className="mt-1">
                                    Invoice:{" "}
                                    <span className="font-medium">{success.invoiceId}</span>
                                </p>
                                {success.sheetTitle && success.rowNumber ? (
                                    <p className="mt-1 text-green-800">
                                        Google Sheet: {success.sheetTitle}, row{" "}
                                        {success.rowNumber}
                                    </p>
                                ) : null}
                                {success.warning ? (
                                    <p className="mt-2 text-amber-800">{success.warning}</p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
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
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}
