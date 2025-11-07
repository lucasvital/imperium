import { Skeleton } from '../../../../components/Skeleton';

export function TransactionItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-500 p-4 rounded-2xl flex items-center justify-between gap-4">
      <div className="flex-1 flex items-center gap-3">
        <Skeleton className="w-10 h-10" variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32 h-4" variant="text" />
          <Skeleton className="w-24 h-3" variant="text" />
        </div>
      </div>
      <Skeleton className="w-20 h-5" variant="text" />
    </div>
  );
}

