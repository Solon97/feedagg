import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-16 bg-slate-700" />
      <Skeleton className="h-3 w-32 bg-slate-700" />
      <Skeleton className="h-8 w-full bg-slate-700" />
    </div>
  );
}
