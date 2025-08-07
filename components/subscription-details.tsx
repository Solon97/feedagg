import { SubscriptionSkeleton } from "@/components/subscription-skeleton";
import { Button } from "@/components/ui/button";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import { Crown } from "lucide-react";
import Link from "next/link";
interface SubscriptionDetailsProps {
  isActive: boolean;
  currentPeriodEnd: Date | null;
  manageUrl: string;
  loading?: boolean;
  className?: string;
}

const email = "contact@feedagg.com";

export function SubscriptionDetails({
  isActive,
  currentPeriodEnd,
  manageUrl,
  loading,
  className,
}: SubscriptionDetailsProps) {
  const { t, localizedDate } = useLocalizedTranslations();

  if (loading) {
    return <SubscriptionSkeleton />;
  }

  if (isActive) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span>🌟</span>
            <span className="text-white font-medium">
              {t("subscription.details.plan")}: {t("subscription.premium")}
            </span>
          </div>

          {currentPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>🔄</span>
              <span>
                {t("subscription.details.renews")}:{" "}
                {localizedDate(currentPeriodEnd)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>❓</span>
            <span>{t("subscription.details.needHelp")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>📩</span>
            <a
              href={`mailto:${email}`}
              className="text-teal-400 hover:text-teal-300 underline"
            >
              {email}
            </a>
          </div>
        </div>
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
          {t("subscription.subscribeNow")}
        </Button>
      </Link>
    </div>
  );
}
