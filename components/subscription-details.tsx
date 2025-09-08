import { SubscriptionSkeleton } from "@/components/subscription-skeleton";
import { Button } from "@/components/ui/button";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import { Calendar, Crown, LifeBuoy, Mail, Settings } from "lucide-react";
import Link from "next/link";
interface SubscriptionDetailsProps {
  isActive: boolean;
  currentPeriodEnd: Date | null;
  manageUrl: string;
  loading?: boolean;
  className?: string;
}

const email = "contato@feedagg.com";

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
    const customerPortalUrl =
      process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL || "";

    return (
      <div className={`space-y-3 ${className}`}>
        {/* Renew date (Premium only) */}
        {currentPeriodEnd && (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>
              {t("subscription.details.renews")}{" "}
              {localizedDate(currentPeriodEnd)}
            </span>
          </div>
        )}

        {/* Manage subscription - single action */}
        {customerPortalUrl && (
          <div className="pt-1">
            <a
              href={customerPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
              >
                <Settings className="mr-2 h-4 w-4" />
                {t("subscription.manageSubscription")}
              </Button>
            </a>
          </div>
        )}

        {/* Help / Contact */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <LifeBuoy className="h-4 w-4 text-gray-400" />
            <span>{t("subscription.details.needHelp")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Mail className="h-4 w-4 text-gray-400" />
            <a
              href={`mailto:${email}`}
              className="text-cyan-300 hover:text-cyan-200 underline"
            >
              {email}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Link href="/subscribe">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
        >
          <Crown className="mr-2 h-4 w-4" />
          {t("subscription.subscribeNow")}
        </Button>
      </Link>

      {/* Help / Contact */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <LifeBuoy className="h-4 w-4 text-gray-400" />
          <span>{t("subscription.details.needHelp")}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Mail className="h-4 w-4 text-gray-400" />
          <a
            href={`mailto:${email}`}
            className="text-cyan-300 hover:text-cyan-200 underline"
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  );
}
