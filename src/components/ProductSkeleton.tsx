export function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="min-w-0 animate-pulse">
          <div className="skeleton-light aspect-[4/5] w-full bg-mist" />
          <div className="border-b border-veil/60 py-4">
            <div className="skeleton-light mb-3 h-2 w-24 bg-mist" />
            <div className="skeleton-light h-5 w-4/5 bg-mist" />
            <div className="skeleton-light mt-2 h-5 w-3/5 bg-mist" />
            <div className="mt-4 flex items-center justify-between">
              <div className="skeleton-light h-3 w-14 bg-mist" />
              <div className="skeleton-light size-10 bg-mist" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductDetailsSkeleton() {
  return (
    <div className="container-mn py-10 lg:py-16" aria-hidden="true">
      <div className="mb-10 flex gap-3">
        <div className="skeleton-light h-3 w-16 bg-mist" />
        <div className="skeleton-light h-3 w-20 bg-mist" />
        <div className="skeleton-light h-3 w-28 bg-mist" />
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="skeleton-light aspect-[4/5] w-full bg-mist" />
          <div className="mt-4 flex gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="skeleton-light aspect-square w-20 bg-mist"
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 lg:pl-8">
          <div className="skeleton-light h-2 w-24 bg-mist" />
          <div className="skeleton-light mt-8 h-14 w-full bg-mist" />
          <div className="skeleton-light mt-3 h-14 w-4/5 bg-mist" />
          <div className="skeleton-light mt-8 h-6 w-32 bg-mist" />
          <div className="mt-12 space-y-3">
            <div className="skeleton-light h-3 w-full bg-mist" />
            <div className="skeleton-light h-3 w-full bg-mist" />
            <div className="skeleton-light h-3 w-11/12 bg-mist" />
            <div className="skeleton-light h-3 w-8/12 bg-mist" />
          </div>
          <div className="mt-12 flex gap-3">
            <div className="skeleton-light h-14 w-36 bg-mist" />
            <div className="skeleton-light h-14 flex-1 bg-mist" />
          </div>
        </div>
      </div>
    </div>
  )
}
