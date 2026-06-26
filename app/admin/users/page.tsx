"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { AdminOnlyGate } from "@/components/admin/AdminOnlyGate";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getSupabaseClient } from "@/lib/supabase/client";
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

type StaffRole = "admin" | "receptionist";

type StaffUser = {
    id: string;
    supabaseUserId: string;
    email: string;
    role: StaffRole;
    createdAt: string;
};

type StaffListResponse =
    | { ok: true; users: StaffUser[] }
    | { error: string };

type UpsertResponse =
    | { ok: true; user: StaffUser }
    | { error: string };

type UpdateRoleResponse =
    | { ok: true; user: StaffUser }
    | { error: string };

type RemoveResponse =
    | {
          ok: true;
          removed: StaffUser;
          authSoftDeleted: boolean;
          warning?: string;
      }
    | { error: string };

async function getTokenOrThrow(): Promise<string> {
    const supabase = getSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Unauthorized");
    return token;
}

export default function AdminUsersPage() {
    const { user, isLoading } = useAuth();
    const queryClient = useQueryClient();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState<StaffRole>("receptionist");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const canManageStaff = Boolean(user) && !isLoading;

    const staffQuery = useQuery({
        queryKey: ["admin", "users"],
        enabled: Boolean(user) && !isLoading && canManageStaff,
        queryFn: async (): Promise<StaffUser[]> => {
            const token = await getTokenOrThrow();
            const res = await fetch("/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = (await res.json()) as StaffListResponse;
            if (!res.ok) throw new Error("error" in payload ? payload.error : "Request failed");
            if (!("ok" in payload) || payload.ok !== true) throw new Error("Request failed");
            return payload.users;
        },
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    async function onInviteOrSave() {
        setError(null);
        setSuccess(null);
        setSubmitting(true);
        try {
            const token = await getTokenOrThrow();
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: email.trim(), role }),
            });
            const payload = (await res.json()) as UpsertResponse;
            if (!res.ok) {
                setError("error" in payload ? payload.error : "Request failed");
                return;
            }
            if (!("ok" in payload) || payload.ok !== true) {
                setError("Unexpected server response.");
                return;
            }
            setEmail("");
            setRole("receptionist");
            setSuccess(`Saved: ${payload.user.email} (${payload.user.role}). Invite email sent if needed.`);
            await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Request failed");
        } finally {
            setSubmitting(false);
        }
    }

    async function onChangeRole(staffId: string, nextRole: StaffRole) {
        setError(null);
        setSuccess(null);
        setSubmitting(true);
        try {
            const token = await getTokenOrThrow();
            const res = await fetch(`/api/admin/users/${encodeURIComponent(staffId)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: nextRole }),
            });
            const payload = (await res.json()) as UpdateRoleResponse;
            if (!res.ok) {
                setError("error" in payload ? payload.error : "Request failed");
                return;
            }
            if (!("ok" in payload) || payload.ok !== true) {
                setError("Unexpected server response.");
                return;
            }
            setSuccess(`Updated: ${payload.user.email} is now ${payload.user.role}.`);
            await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Request failed");
        } finally {
            setSubmitting(false);
        }
    }

    async function onRemove(staff: StaffUser) {
        setError(null);
        setSuccess(null);
        const confirmed = window.confirm(
            `Remove ${staff.email} (${staff.role})?\n\nThis revokes dashboard access and soft-deletes their Supabase Auth user.`,
        );
        if (!confirmed) return;

        setSubmitting(true);
        try {
            const token = await getTokenOrThrow();
            const res = await fetch(`/api/admin/users/${encodeURIComponent(staff.id)}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = (await res.json()) as RemoveResponse;
            if (!res.ok) {
                setError("error" in payload ? payload.error : "Request failed");
                return;
            }
            if (!("ok" in payload) || payload.ok !== true) {
                setError("Unexpected server response.");
                return;
            }
            setSuccess(
                payload.warning ??
                    `Removed ${payload.removed.email}. Supabase soft-delete: ${payload.authSoftDeleted ? "ok" : "failed"}.`,
            );
            await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Request failed");
        } finally {
            setSubmitting(false);
        }
    }

    if (isLoading) return null;
    if (!user) return null;

    return (
        <AdminOnlyGate>
            <AdminPageContainer maxWidth="5xl">
                <AdminPageHeader
                    title="Staff access"
                    description="Invite new admins and receptionists, change roles, or remove access."
                />

                <Card className="p-6 mt-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <Label htmlFor="staff-email">Email</Label>
                            <Input
                                id="staff-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="staff@example.com"
                                disabled={submitting}
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select
                                value={role}
                                onValueChange={(v) => setRole(v as StaffRole)}
                                disabled={submitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="receptionist">Receptionist</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3" role="status">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            onClick={() => void onInviteOrSave()}
                            disabled={submitting || !email.trim()}
                        >
                            {submitting ? "Saving…" : "Invite / save"}
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 mt-6">
                    <h2 className="font-semibold text-gray-900">Staff users</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        These users can access the admin dashboard depending on role.
                    </p>

                    <div className="mt-4">
                        {staffQuery.isLoading ? (
                            <p className="text-sm text-gray-600">Loading…</p>
                        ) : staffQuery.isError ? (
                            <p className="text-sm text-red-700" role="alert">
                                {(staffQuery.error as Error).message}
                            </p>
                        ) : staffQuery.data && staffQuery.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-600 border-b">
                                            <th className="py-2 pr-4">Email</th>
                                            <th className="py-2 pr-4">Role</th>
                                            <th className="py-2 pr-4">Created</th>
                                            <th className="py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffQuery.data.map((s) => (
                                            <tr key={s.id} className="border-b last:border-b-0">
                                                <td className="py-2 pr-4 font-medium text-gray-900">
                                                    {s.email}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                        {s.role}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-4 text-gray-600">
                                                    {new Date(s.createdAt).toLocaleString()}
                                                </td>
                                                <td className="py-2">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                void onChangeRole(
                                                                    s.id,
                                                                    s.role === "admin"
                                                                        ? "receptionist"
                                                                        : "admin",
                                                                )
                                                            }
                                                            disabled={submitting}
                                                        >
                                                            Make {s.role === "admin" ? "receptionist" : "admin"}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => void onRemove(s)}
                                                            disabled={submitting}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">No staff users found.</p>
                        )}
                    </div>
                </Card>
            </AdminPageContainer>
        </AdminOnlyGate>
    );
}

