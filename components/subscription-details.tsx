import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/premium-badge";
import { SubscriptionSkeleton } from "@/components/subscription-skeleton";
import { CreditCard, Crown } from "lucide-react";

interface SubscriptionDetailsProps {
  isActive: boolean;
  currentPeriodEnd: Date | null;
  manageUrl: string;
  loading?: boolean;
  className?: string;
}

export function SubscriptionDetails({
  isActive,
  currentPeriodEnd,
  manageUrl,
  loading,
  className,
}: SubscriptionDetailsProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <SubscriptionSkeleton />;
  }

  if (isActive) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <PremiumBadge />
        </div>

        {currentPeriodEnd && (
          <p className="text-xs text-gray-400">
            Valid until {formatDate(currentPeriodEnd)}
          </p>
        )}

        <Link href={manageUrl}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-700 px-0"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <Link href="/subscribe">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-teal-400 hover:text-teal-300 hover:bg-slate-700 px-0"
        >
          <Crown className="mr-2 h-4 w-4" />
          Subscribe Now
        </Button>
      </Link>
    </div>
  );
}
