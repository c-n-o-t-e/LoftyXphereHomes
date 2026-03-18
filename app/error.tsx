"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">Something went wrong</h1>
        <p className="text-black/70 mb-8">
          Please try again. If this keeps happening, return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white h-12 px-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-black/20 hover:bg-black/5 h-12 px-6"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

