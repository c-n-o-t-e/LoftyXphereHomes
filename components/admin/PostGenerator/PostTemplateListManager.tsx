"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { PRESET_META } from "@/lib/post-generator/defaults";
import type { PostPresetKey, PostTemplateRecord } from "@/lib/post-generator/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function PostTemplateListManager() {
    const router = useRouter();
    const [templates, setTemplates] = useState<PostTemplateRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState("Luxury Editorial Post");
    const [presetKey, setPresetKey] = useState<PostPresetKey>("luxury-editorial");

    const authHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/post-templates", { headers });
            const data = (await res.json()) as {
                templates?: PostTemplateRecord[];
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Failed to load");
            setTemplates(data.templates ?? []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        void load();
    }, [load]);

    const create = async () => {
        setCreating(true);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/post-templates", {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ title, presetKey }),
            });
            const data = (await res.json()) as {
                template?: PostTemplateRecord;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Create failed");
            toast.success("Template created");
            router.push(`/admin/post-generator/${data.template!.id}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Create failed");
        } finally {
            setCreating(false);
        }
    };

    const duplicate = async (id: string) => {
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/post-templates/${id}/duplicate`, {
                method: "POST",
                headers,
            });
            const data = (await res.json()) as {
                template?: PostTemplateRecord;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Duplicate failed");
            toast.success("Duplicated");
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Duplicate failed");
        }
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this template?")) return;
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/post-templates/${id}`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? "Delete failed");
            }
            toast.success("Deleted");
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                    New Instagram post template
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Starts from the approved luxury editorial layout.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Template title"
                        className="sm:flex-1"
                    />
                    <Select
                        value={presetKey}
                        onValueChange={(v) => setPresetKey(v as PostPresetKey)}
                    >
                        <SelectTrigger className="sm:w-56">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(PRESET_META) as PostPresetKey[]).map((key) => (
                                <SelectItem key={key} value={key}>
                                    {PRESET_META[key].label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => void create()}
                        disabled={creating || !title.trim()}
                        className="bg-slate-900 hover:bg-slate-800"
                    >
                        {creating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create
                    </Button>
                </div>
            </Card>

            {loading ? (
                <p className="text-sm text-slate-500">Loading templates…</p>
            ) : templates.length === 0 ? (
                <Card className="border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No saved templates yet. Create your first luxury editorial post.
                </Card>
            ) : (
                <div className="grid gap-3">
                    {templates.map((tpl) => (
                        <Card
                            key={tpl.id}
                            className="flex flex-wrap items-center justify-between gap-3 border-slate-200 p-4 shadow-sm"
                        >
                            <div className="min-w-0">
                                <Link
                                    href={`/admin/post-generator/${tpl.id}`}
                                    className="font-semibold text-slate-900 hover:underline"
                                >
                                    {tpl.title}
                                </Link>
                                <p className="mt-1 text-xs text-slate-500">
                                    {tpl.presetKey
                                        ? PRESET_META[tpl.presetKey]?.label ?? tpl.presetKey
                                        : "Custom"}{" "}
                                    · {tpl.status} ·{" "}
                                    {new Date(tpl.updatedAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/post-generator/${tpl.id}`}>
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => void duplicate(tpl.id)}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => void remove(tpl.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
