"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Copy, FileImage, Loader2, Plus, Trash2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { FLYER_TEMPLATE_OPTIONS } from "@/lib/flyers/constants";
import type { FlyerRecord, FlyerTemplateKey } from "@/lib/flyers/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function FlyerListManager() {
    const [flyers, setFlyers] = useState<FlyerRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("Luxury Shortlet Flyer — Abuja");
    const [newTemplate, setNewTemplate] = useState<FlyerTemplateKey>(
        FLYER_TEMPLATE_OPTIONS[0].key,
    );

    const authHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    const loadFlyers = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/flyers", { headers });
            const data = (await res.json()) as { flyers?: FlyerRecord[]; error?: string };
            if (!res.ok) throw new Error(data.error ?? "Failed to load flyers");
            setFlyers(data.flyers ?? []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load flyers");
        } finally {
            setIsLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        void loadFlyers();
    }, [loadFlyers]);

    const createFlyer = async () => {
        setIsCreating(true);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/flyers", {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle,
                    templateKey: newTemplate,
                }),
            });
            const data = (await res.json()) as { flyer?: FlyerRecord; error?: string };
            if (!res.ok) throw new Error(data.error ?? "Failed to create flyer");
            toast.success("Flyer draft created");
            window.location.href = `/admin/flyers/${data.flyer!.id}`;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create flyer");
        } finally {
            setIsCreating(false);
        }
    };

    const duplicateFlyer = async (id: string) => {
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/flyers/${id}/duplicate`, {
                method: "POST",
                headers,
            });
            const data = (await res.json()) as { flyer?: FlyerRecord; error?: string };
            if (!res.ok) throw new Error(data.error ?? "Failed to duplicate");
            toast.success("Flyer duplicated");
            await loadFlyers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to duplicate");
        }
    };

    const archiveFlyer = async (id: string) => {
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/flyers/${id}`, {
                method: "PATCH",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ARCHIVED" }),
            });
            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? "Failed to archive");
            }
            toast.success("Flyer archived");
            await loadFlyers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to archive");
        }
    };

    const deleteFlyer = async (id: string) => {
        if (!window.confirm("Delete this flyer permanently?")) return;
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/flyers/${id}`, { method: "DELETE", headers });
            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? "Failed to delete");
            }
            toast.success("Flyer deleted");
            await loadFlyers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading flyers…
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Card className="rounded-2xl border-slate-200/80 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Create new flyer</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Start from a premium template. All content stays editable after creation.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="new-flyer-title">Title</Label>
                        <Input
                            id="new-flyer-title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Template</Label>
                        <Select
                            value={newTemplate}
                            onValueChange={(value) => setNewTemplate(value as FlyerTemplateKey)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FLYER_TEMPLATE_OPTIONS.map((template) => (
                                    <SelectItem key={template.key} value={template.key}>
                                        {template.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button className="mt-4" onClick={() => void createFlyer()} disabled={isCreating}>
                    {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                    Create flyer
                </Button>
            </Card>

            <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Your flyers
                </h2>
                {flyers.length === 0 ? (
                    <Card className="rounded-2xl border-dashed p-8 text-center text-sm text-slate-500">
                        No flyers yet. Create your first print-ready marketing flyer above.
                    </Card>
                ) : (
                    flyers.map((flyer) => (
                        <Card
                            key={flyer.id}
                            className="flex flex-col gap-4 rounded-2xl border-slate-200/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-slate-100 p-2.5">
                                    <FileImage className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <Link
                                        href={`/admin/flyers/${flyer.id}`}
                                        className="font-semibold text-slate-900 hover:text-[#FA5C5C]"
                                    >
                                        {flyer.title}
                                    </Link>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {flyer.templateKey.replace(/-/g, " ")} · {flyer.pageSize} ·{" "}
                                        {flyer.status.toLowerCase()}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Updated {new Date(flyer.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/flyers/${flyer.id}`}>Edit</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void duplicateFlyer(flyer.id)}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    Duplicate
                                </Button>
                                {flyer.status !== "ARCHIVED" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void archiveFlyer(flyer.id)}
                                    >
                                        Archive
                                    </Button>
                                ) : null}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => void deleteFlyer(flyer.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
