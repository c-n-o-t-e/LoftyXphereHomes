"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { apartments } from "@/lib/data/apartments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerCalendar } from "@/components/DatePickerCalendar";
import { useApartmentAvailability } from "@/hooks/useApartmentAvailability";
import { useAdminMe } from "@/hooks/useAdminMe";
import { buildCheckoutDisabledDates } from "@/lib/booking/checkoutDisabledDates";
import {
    formatDateForInput,
    formatDisplayDate,
    parseLocalDate,
} from "@/lib/booking/datePickerDisplay";
import { computeBookingQuote } from "@/lib/pricing";

type AdminBookingResponse =
    | { ok: true; bookingId: string; reference: string }
    | { error: string; code?: string };

function toIsoDate(input: string) {
    return input;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(price);
}

export default function NewManualBookingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: me } = useAdminMe(Boolean(user) && !isLoading);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [apartmentId, setApartmentId] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [amountNgn, setAmountNgn] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentReference, setPaymentReference] = useState("");
    const [openCalendar, setOpenCalendar] = useState<"checkIn" | "checkOut" | null>(null);

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
    const selectedApartment = useMemo(
        () => apartmentOptions.find((a) => a.id === apartmentId),
        [apartmentId, apartmentOptions]
    );
    const today = useMemo(() => formatDateForInput(new Date()), []);
    const { data: availabilityData, isFetching: availabilityLoading } =
        useApartmentAvailability(apartmentId);
    const blockedDates = useMemo(
        () => availabilityData?.blockedDates ?? [],
        [availabilityData?.blockedDates]
    );
    const bookingRanges = useMemo(
        () => availabilityData?.bookingRanges ?? [],
        [availabilityData?.bookingRanges]
    );

    const minCheckOut = checkIn
        ? (() => {
            const d = parseLocalDate(checkIn);
            d.setDate(d.getDate() + 1);
            return formatDateForInput(d);
        })()
        : today;

    const checkoutDisabledDates = useMemo(() => {
        return buildCheckoutDisabledDates(checkIn, bookingRanges);
    }, [checkIn, bookingRanges]);

    const suggestedQuote = useMemo(() => {
        if (!selectedApartment || !checkIn || !checkOut) return null;
        return computeBookingQuote(selectedApartment.pricePerNight, checkIn, checkOut);
    }, [selectedApartment, checkIn, checkOut]);

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
                if (res.status === 409 || ("code" in payload && payload.code === "DATE_CONFLICT")) {
                    void queryClient.invalidateQueries({ queryKey: ["availability", apartmentId] });
                    setCheckIn("");
                    setCheckOut("");
                    setOpenCalendar(null);
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
            void queryClient.invalidateQueries({ queryKey: ["availability", apartmentId] });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to create booking.");
        } finally {
            setSubmitting(false);
        }
    }

    if (isLoading) return null;
    if (!user) return null;

    const canCancelBookings = me?.ok === true && me.role === "admin";

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
                    <div className="flex gap-2 flex-wrap">
                        {canCancelBookings && (
                            <Button variant="outline" asChild>
                                <Link href="/admin/bookings/cancel">Cancel booking</Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/admin">Back</Link>
                        </Button>
                    </div>
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
                                onValueChange={(v) => {
                                    setApartmentId(v);
                                    setCheckIn("");
                                    setCheckOut("");
                                    setOpenCalendar(null);
                                    setError(null);
                                    void queryClient.invalidateQueries({ queryKey: ["availability", v] });
                                }}
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
                            <Label className="text-sm font-medium">Check-in</Label>
                            <div className="relative mt-1">
                                <button
                                    type="button"
                                    onClick={() => setOpenCalendar(openCalendar === "checkIn" ? null : "checkIn")}
                                    disabled={submitting || !apartmentId}
                                    className="w-full h-10 px-3 flex items-center justify-between rounded-md border border-input bg-background text-left text-sm hover:border-black/40 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className={checkIn ? "text-gray-900" : "text-gray-500"}>
                                        {checkIn ? formatDisplayDate(checkIn) : "Select check-in date"}
                                    </span>
                                    <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </button>
                                <DatePickerCalendar
                                    open={openCalendar === "checkIn" && Boolean(apartmentId)}
                                    onClose={() => setOpenCalendar(null)}
                                    value={checkIn}
                                    minDate={today}
                                    disabledDates={blockedDates}
                                    onSelect={(date) => {
                                        setCheckIn(date);
                                        if (checkOut && date >= checkOut) setCheckOut("");
                                        setError(null);
                                        setTimeout(() => setOpenCalendar("checkOut"), 150);
                                    }}
                                    onClear={() => {
                                        setCheckIn("");
                                        setCheckOut("");
                                    }}
                                    placement="bottom"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Check-out</Label>
                            <div className="relative mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!checkIn) {
                                            setError("Please select a check-in date first.");
                                            return;
                                        }
                                        setOpenCalendar(openCalendar === "checkOut" ? null : "checkOut");
                                    }}
                                    disabled={submitting || !apartmentId}
                                    className="w-full h-10 px-3 flex items-center justify-between rounded-md border border-input bg-background text-left text-sm hover:border-black/40 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className={checkOut ? "text-gray-900" : "text-gray-500"}>
                                        {checkOut ? formatDisplayDate(checkOut) : "Select check-out date"}
                                    </span>
                                    <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </button>
                                <DatePickerCalendar
                                    open={openCalendar === "checkOut" && Boolean(apartmentId)}
                                    onClose={() => setOpenCalendar(null)}
                                    value={checkOut}
                                    minDate={minCheckOut}
                                    disabledDates={checkoutDisabledDates}
                                    onSelect={(date) => {
                                        setCheckOut(date);
                                        setError(null);
                                    }}
                                    onClear={() => setCheckOut("")}
                                    placement="bottom"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 -mt-2">
                            {!apartmentId ? (
                                <p className="text-xs text-gray-500">
                                    Select an apartment first to load live availability.
                                </p>
                            ) : availabilityLoading ? (
                                <p className="text-xs text-gray-500">Loading availability…</p>
                            ) : suggestedQuote ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                    <p>
                                        Suggested website total:{" "}
                                        <span className="font-semibold text-gray-900">
                                            {formatPrice(suggestedQuote.totalNgn)}
                                        </span>{" "}
                                        for {suggestedQuote.nights} night
                                        {suggestedQuote.nights !== 1 ? "s" : ""}.
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Manual amount is still editable for staff adjustments.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Availability shown here matches the public booking calendar.
                                </p>
                            )}
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

