export function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-24 bg-slate-800/50 rounded-lg mb-3" />
      <div className="h-24 bg-slate-800/50 rounded-lg mb-3" />
      <div className="h-24 bg-slate-800/50 rounded-lg mb-3" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-slate-800/50 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-700 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-8 bg-slate-700 rounded w-16" />
        <div className="h-8 bg-slate-700 rounded w-16" />
      </div>
    </div>
  )
}
