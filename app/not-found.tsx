import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
          <Search className="h-8 w-8 text-black/60" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">Page not found</h1>
        <p className="text-black/70 mb-8">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white h-12 px-6"
          >
            <Link href="/apartments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse apartments
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-black/20 hover:bg-[#E84A4A] h-12 px-6"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

