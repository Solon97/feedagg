import { Badge } from "@/components/ui/badge";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";

interface PremiumBadgeProps {
  className?: string;
}

export function PremiumBadge({ className }: PremiumBadgeProps) {
  const { t } = useLocalizedTranslations();

  return (
    <Badge
      variant="secondary"
      className={`bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold text-xs px-2 py-1 ${className}`}
    >
      {t("subscription.premium")}
    </Badge>
  );
}
