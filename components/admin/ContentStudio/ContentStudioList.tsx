"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/lib/content-studio/defaults";
import { LAYOUT_DEFINITIONS } from "@/lib/content-studio/layouts";
import {
    CONTENT_CATEGORIES,
    type ContentCategory,
    type EditorialPostRecord,
} from "@/lib/content-studio/types";
import { recommendEditorialDesign } from "@/lib/content-studio/recommend";
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

export function ContentStudioList() {
    const router = useRouter();
    const [posts, setPosts] = useState<EditorialPostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState("Five things to know before booking");
    const [category, setCategory] = useState<ContentCategory>("educational");

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
            const res = await fetch("/api/admin/editorial-posts", { headers });
            const data = (await res.json()) as {
                posts?: EditorialPostRecord[];
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Failed to load");
            setPosts(data.posts ?? []);
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
            const recommendation = recommendEditorialDesign({ title, category });
            const headers = await authHeaders();
            const res = await fetch("/api/admin/editorial-posts", {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    category,
                    layoutId: recommendation.layoutId,
                }),
            });
            const data = (await res.json()) as {
                post?: EditorialPostRecord;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Create failed");
            toast.success("Studio draft created");
            router.push(`/admin/content-studio/${data.post!.id}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Create failed");
        } finally {
            setCreating(false);
        }
    };

    const duplicate = async (id: string) => {
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/editorial-posts/${id}/duplicate`, {
                method: "POST",
                headers,
            });
            const data = (await res.json()) as {
                post?: EditorialPostRecord;
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
        if (!confirm("Delete this editorial post?")) return;
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/admin/editorial-posts/${id}`, {
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
                    New editorial post
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Informational and lifestyle content — not the apartment showcase
                    generator. Layout is recommended from the title and category.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
                    <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Happy new week"
                    />
                    <Select
                        value={category}
                        onValueChange={(value) => setCategory(value as ContentCategory)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CONTENT_CATEGORIES.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {CATEGORY_LABELS[item]}
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
                <p className="text-sm text-slate-500">Loading studio drafts…</p>
            ) : posts.length === 0 ? (
                <Card className="border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No editorial posts yet. Start with a new-week greeting or a guest
                    education piece.
                </Card>
            ) : (
                <div className="grid gap-3">
                    {posts.map((post) => (
                        <Card
                            key={post.id}
                            className="flex flex-wrap items-center justify-between gap-3 border-slate-200 p-4 shadow-sm"
                        >
                            <div className="min-w-0">
                                <Link
                                    href={`/admin/content-studio/${post.id}`}
                                    className="font-semibold text-slate-900 hover:underline"
                                >
                                    {post.title}
                                </Link>
                                <p className="mt-1 text-xs text-slate-500">
                                    {CATEGORY_LABELS[post.category]} ·{" "}
                                    {LAYOUT_DEFINITIONS[post.layoutId]?.name ?? post.layoutId} ·{" "}
                                    {post.status} · {new Date(post.updatedAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/content-studio/${post.id}`}>Open</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => void duplicate(post.id)}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => void remove(post.id)}
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
