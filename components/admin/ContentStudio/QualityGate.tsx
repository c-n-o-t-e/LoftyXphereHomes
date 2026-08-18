"use client";

import type { QualityReport } from "@/lib/content-studio/types";

export function QualityGate({ report }: { report: QualityReport }) {
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
                    Contrast, collision, logo, and CTA checks passed.
                </p>
            )}
        </div>
    );
}
