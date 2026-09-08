"use client";

import type { QualityReport } from "@/lib/content-studio/types";

const PASSED = [
    "Text overflow",
    "Element collisions",
    "Visual asset overflow",
    "Contrast",
    "Logo visibility",
    "CTA visibility",
    "Safe margins",
    "Footer visibility",
];

export function QualityGate({ report }: { report: QualityReport }) {
    const failed = new Set(report.issues.map((issue) => issue.id));

    return (
        <div
            className={`rounded-xl border px-3 py-2 text-sm ${
                report.ready
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
        >
            <div className="font-semibold">
                {report.ready ? "Ready to export" : "Design needs attention"}
            </div>
            {report.issues.length > 0 ? (
                <ul className="mt-1 space-y-0.5 text-xs">
                    {report.issues.map((issue) => (
                        <li key={issue.id}>
                            {issue.severity === "error" ? "•" : "–"} {issue.message}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-1 text-xs opacity-80">
                    {PASSED.map((label) => `✓ ${label}`).join("   ")}
                </p>
            )}
            {report.ready && report.issues.length > 0 ? (
                <p className="mt-1 text-[11px] opacity-70">
                    Warnings will not block export. Failed checks: {failed.size}.
                </p>
            ) : null}
        </div>
    );
}
