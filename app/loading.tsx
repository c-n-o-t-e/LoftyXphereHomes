export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-10 w-56 bg-black/10 rounded mb-6" />
          <div className="h-5 w-full max-w-xl bg-black/10 rounded mb-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-black/10 overflow-hidden">
                <div className="h-56 bg-black/10" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-2/3 bg-black/10 rounded" />
                  <div className="h-4 w-full bg-black/10 rounded" />
                  <div className="h-4 w-5/6 bg-black/10 rounded" />
                  <div className="h-10 w-40 bg-black/10 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

