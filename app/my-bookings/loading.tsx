export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-black/10 rounded mb-3" />
          <div className="h-4 w-64 bg-black/10 rounded mb-10" />

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-black/10 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-40 bg-black/10" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-5 w-2/3 bg-black/10 rounded" />
                    <div className="h-4 w-1/2 bg-black/10 rounded" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-3 w-16 bg-black/10 rounded" />
                          <div className="h-4 w-24 bg-black/10 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="h-4 w-40 bg-black/10 rounded pt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

