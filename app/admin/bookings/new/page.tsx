"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { apartments } from "@/lib/data/apartments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AdminBookingResponse =
    | { ok: true; bookingId: string; reference: string }
    | { error: string; code?: string };

function toIsoDate(input: string) {
    return input;
}

export default function NewManualBookingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [apartmentId, setApartmentId] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [amountNgn, setAmountNgn] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentReference, setPaymentReference] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{
        bookingId: string;
        reference: string;
    } | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login?redirect=/admin/bookings/new");
        }
    }, [isLoading, user, router]);

    const apartmentOptions = useMemo(() => apartments, []);

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
                router.push("/login?redirect=/admin/bookings/new");
                return;
            }

            const parsedAmount = Number(String(amountNgn).replace(/,/g, "").trim());
            if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                setError("Amount must be a positive number.");
                return;
            }

            const res = await fetch("/api/admin/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    name,
                    email: email.trim() ? email.trim() : undefined,
                    phone,
                    apartmentId,
                    checkIn: toIsoDate(checkIn),
                    checkOut: toIsoDate(checkOut),
                    amountNgn: Math.round(parsedAmount),
                    paymentMethod: paymentMethod.trim() ? paymentMethod : undefined,
                    paymentReference: paymentReference.trim()
                        ? paymentReference.trim()
                        : undefined,
                }),
            });

            const payload = (await res.json()) as AdminBookingResponse;
            if (!res.ok) {
                if ("error" in payload && typeof payload.error === "string") {
                    setError(payload.error);
                } else {
                    setError("Failed to create booking.");
                }
                return;
            }
            if (!("ok" in payload) || payload.ok !== true) {
                setError("Unexpected server response.");
                return;
            }
            setSuccess({
                bookingId: payload.bookingId,
                reference: payload.reference,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to create booking.");
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
                            New manual booking
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Creates a PAID booking, generates an invoice PDF, and appends the
                            row to Google Sheets.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin">Back</Link>
                    </Button>
                </div>

                <Card className="p-6 mt-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                placeholder="John Doe"
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email (optional)</Label>
                            <Input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                placeholder="you@example.com"
                                disabled={submitting}
                                type="email"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoComplete="tel"
                                placeholder="+234 800 000 0000"
                                disabled={submitting}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <Label>Apartment</Label>
                            <Select
                                value={apartmentId}
                                onValueChange={(v) => setApartmentId(v)}
                                disabled={submitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select apartment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {apartmentOptions.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name} ({a.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="checkIn">Check-in</Label>
                            <Input
                                id="checkIn"
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <Label htmlFor="checkOut">Check-out</Label>
                            <Input
                                id="checkOut"
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <Label htmlFor="amount">Amount (₦)</Label>
                            <Input
                                id="amount"
                                inputMode="numeric"
                                value={amountNgn}
                                onChange={(e) => setAmountNgn(e.target.value)}
                                placeholder="950000"
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <Label htmlFor="paymentReference">Payment reference (optional)</Label>
                            <Input
                                id="paymentReference"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                placeholder="POS receipt / bank ref / cash note"
                                disabled={submitting}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="paymentMethod">Payment method (optional)</Label>
                            <Input
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                placeholder="cash / transfer / pos"
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700" role="alert">
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800 font-medium">
                                Booking created successfully.
                            </p>
                            <p className="text-xs text-green-900/70 mt-1">
                                Booking ID: {success.bookingId} • Reference: {success.reference}
                            </p>
                            <p className="text-sm text-green-800 mt-2">
                                Invoice + Google Sheets will sync in the background.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex gap-3 justify-end">
                        <Button
                            onClick={() => void submit()}
                            disabled={
                                submitting ||
                                !name.trim() ||
                                !phone.trim() ||
                                !apartmentId ||
                                !checkIn ||
                                !checkOut ||
                                !amountNgn.trim()
                            }
                        >
                            {submitting ? "Creating…" : "Create booking"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

