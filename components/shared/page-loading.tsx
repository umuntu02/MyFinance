import { Skeleton } from "@/components/ui/skeleton";

// Generic loading state shown while the Zustand cache hydrates from the server.
// Mirrors the common page shape (header + 4 stat cards + content) so the layout
// doesn't jump when real data lands. Used by every (app) page behind `hydrated`.
export function PageLoading({ cards = 4 }: { cards?: number }) {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
