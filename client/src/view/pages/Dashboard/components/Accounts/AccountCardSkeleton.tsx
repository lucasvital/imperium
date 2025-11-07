import { Skeleton } from '../../../../components/Skeleton';

export function AccountCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" variant="text" />
        <Skeleton className="w-12 h-12" variant="circular" />
      </div>
      <Skeleton className="w-32 h-6" variant="text" />
    </div>
  );
}

