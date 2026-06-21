export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent ${className}`} />
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

export function TableLoading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 w-full bg-muted/50 animate-pulse rounded-md" />
      ))}
    </div>
  )
}
