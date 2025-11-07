import { Skeleton } from '../../../../components/Skeleton';

export function BudgetCardSkeleton() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32 h-5" variant="text" />
        <Skeleton className="w-20 h-5" variant="text" />
      </div>
      <Skeleton className="w-full h-2 mb-2" variant="rectangular" />
      <div className="flex justify-between mt-4">
        <Skeleton className="w-24 h-4" variant="text" />
        <Skeleton className="w-24 h-4" variant="text" />
      </div>
    </div>
  );
}

