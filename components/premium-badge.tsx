import { Badge } from "@/components/ui/badge";

interface PremiumBadgeProps {
  className?: string;
}

export function PremiumBadge({ className }: PremiumBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold text-xs px-2 py-1 ${className}`}
    >
      Premium
    </Badge>
  );
}
