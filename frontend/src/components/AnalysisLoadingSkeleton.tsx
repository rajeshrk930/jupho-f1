export function AnalysisLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Primary Reason Skeleton */}
      <div>
        <div className="h-3 w-24 skeleton mb-3" />
        <div className="h-6 skeleton mb-2" />
        <div className="h-6 w-4/5 skeleton" />
      </div>

      {/* Why This Happened Skeleton */}
      <div>
        <div className="h-3 w-32 skeleton mb-3" />
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-1 h-1 rounded-full bg-gray-300 mt-2" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton" />
              <div className="h-4 w-5/6 skeleton" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1 h-1 rounded-full bg-gray-300 mt-2" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton" />
              <div className="h-4 w-4/5 skeleton" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1 h-1 rounded-full bg-gray-300 mt-2" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton" />
              <div className="h-4 w-3/4 skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* What to Change Skeleton */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="h-3 w-28 skeleton mb-3" />
        <div className="h-4 skeleton mb-2" />
        <div className="h-4 w-5/6 skeleton mb-2" />
        <div className="h-4 w-3/4 skeleton" />
      </div>

      {/* Actions Skeleton */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <div className="h-10 skeleton flex-1 rounded-xl" />
        <div className="h-10 skeleton flex-1 rounded-xl" />
      </div>
    </div>
  );
}
