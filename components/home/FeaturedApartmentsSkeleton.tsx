export function FeaturedApartmentsSkeleton() {
    return (
        <section className="py-12 sm:py-16 md:py-24 bg-white" aria-hidden>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
                <div className="h-10 w-64 bg-black/10 rounded mx-auto mb-4" />
                <div className="h-5 w-full max-w-xl bg-black/10 rounded mx-auto mb-10" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-black/10 overflow-hidden"
                        >
                            <div className="h-56 bg-black/10" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 w-2/3 bg-black/10 rounded" />
                                <div className="h-4 w-full bg-black/10 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
