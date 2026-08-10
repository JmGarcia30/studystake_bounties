export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-slate-200 rounded-md" />
            <div className="h-5 w-16 bg-purple-100 rounded-full" />
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-md" />
          <div className="h-3 w-2/3 bg-slate-100 rounded-md" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-3 w-24 bg-slate-200 rounded-md" />
            <div className="h-8 w-24 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
