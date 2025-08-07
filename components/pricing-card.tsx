import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { StripePrice } from "@/types/stripe";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";

interface PricingCardProps {
  price: StripePrice;
  isPopular: boolean;
  isLoading: boolean;
  features: string[];
  onSubscribe: (priceId: string) => void;
  variant?: "default" | "example";
}

const formatCurrency = (
  unitAmount: number,
  currency: string,
  locale: string = "en-US"
) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
};

export function PricingCard({
  price,
  isPopular,
  isLoading,
  features,
  onSubscribe,
  variant = "default",
}: PricingCardProps) {
  const { t, locale } = useLocalizedTranslations();
  const isAnnual = price.recurring?.interval === "year";
  const monthlyPrice = isAnnual
    ? price.unit_amount / 12 / 100
    : price.unit_amount / 100;
  const annualTotal = isAnnual ? price.unit_amount / 100 : 0;
  const productName =
    price.product?.name ||
    (isAnnual
      ? t("subscription.pricing.yearly")
      : t("subscription.pricing.monthly"));

  // Get the appropriate locale for currency formatting
  const getCurrencyLocale = () => {
    switch (locale) {
      case "pt-BR":
        return "pt-BR";
      case "en":
      default:
        return "en-US";
    }
  };

  // Format monthly price with proper locale
  const formatMonthlyPrice = (amount: number) => {
    return new Intl.NumberFormat(getCurrencyLocale(), {
      style: "currency",
      currency: price.currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getFeatureDescription = (feature: string): string => {
    const features = {
      unlimited: t("subscription.features.unlimited"),
      clean: t("subscription.features.clean"),
      webAccess: t("subscription.features.webAccess"),
      updates: t("subscription.features.updates"),
    };
    const descriptions: Record<string, string> = {
      [features.unlimited]: t(
        "subscription.pricing.featureDescriptions.unlimitedSources"
      ),
      [features.clean]: t("subscription.pricing.featureDescriptions.cleanFeed"),
      [features.webAccess]: t(
        "subscription.pricing.featureDescriptions.webAccess"
      ),
      [features.updates]: t(
        "subscription.pricing.featureDescriptions.futureUpdates"
      ),
    };

    return descriptions[feature] || t("subscription.pricing.defaultFeature");
  };

  if (variant === "example") {
    return (
      <Card
        className={`border-2 ${
          isPopular
            ? "border-teal-500 bg-slate-800 relative hover:border-teal-400 transition-colors"
            : "border-slate-700 bg-slate-800 hover:border-teal-500 transition-colors"
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-teal-500 text-white">
              {t("subscription.pricing.save50")}
            </Badge>
          </div>
        )}
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-slate-50 mb-4">
            {productName}
          </h3>
          <div className="mb-2">
            <span
              className={`text-4xl font-bold ${
                isPopular ? "text-teal-500" : "text-slate-50"
              }`}
            >
              {formatMonthlyPrice(monthlyPrice)}
            </span>
            <span className="text-slate-400">
              {t("subscription.pricing.month")}
            </span>
          </div>
          <div className="text-sm text-slate-400 mb-6">
            {isAnnual ? (
              `${t("subscription.pricing.billedAnnually")} ${formatCurrency(
                annualTotal * 100,
                price.currency,
                getCurrencyLocale()
              )}${t("subscription.pricing.year")}`
            ) : (
              <span className="opacity-0">Placeholder spacing text</span>
            )}
          </div>
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="text-lg font-semibold text-slate-50 mb-2">
              {t("subscription.pricing.freeTrial")}
            </div>
            <div className="text-slate-400">
              {t("subscription.pricing.noCreditCard")}
            </div>
          </div>
          <ul className="space-y-3 mb-8 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-50">{feature}</div>
                  <div className="text-sm text-slate-400">
                    {getFeatureDescription(feature)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => onSubscribe(price.id)}
            disabled={isLoading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold mb-4"
          >
            {isLoading ? (
              <>
                <Zap className="w-5 h-5 mr-2 animate-spin" />
                {t("subscription.pricing.processing")}
              </>
            ) : (
              `${t("subscription.pricing.startFreeTrial")}`
            )}
          </Button>
          <p className="text-sm text-slate-400">
            {t("subscription.pricing.cancelAnytime")}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Default variant (original style)
  return (
    <Card
      className={`bg-slate-800 border-slate-700 relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isPopular
          ? "border-yellow-400 shadow-lg shadow-yellow-400/20"
          : "hover:border-slate-600"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold">
            {t("subscription.pricing.save50")}
          </Badge>
        </div>
      )}
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">{productName}</h3>
        <div className="mb-2">
          <span
            className={`text-4xl font-bold ${
              isPopular ? "text-yellow-400" : "text-white"
            }`}
          >
            {formatMonthlyPrice(monthlyPrice)}
          </span>
          <span className="text-gray-400">
            {t("subscription.pricing.month")}
          </span>
        </div>
        <div className="text-sm text-gray-400 mb-6 h-5">
          {isAnnual
            ? `${t("subscription.pricing.billedAnnually")} ${formatCurrency(
                annualTotal * 100,
                price.currency,
                getCurrencyLocale()
              )}${t("subscription.pricing.year")}`
            : ""}
        </div>
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg p-4 mb-6 border border-slate-600">
          <div className="text-lg font-semibold text-white mb-2">
            {t("subscription.pricing.freeTrial")}
          </div>
        </div>
        <ul className="space-y-3 mb-8 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-teal-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">{feature}</div>
                <div className="text-sm text-gray-300">
                  {getFeatureDescription(feature)}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Button
          onClick={() => onSubscribe(price.id)}
          disabled={isLoading}
          className={`w-full mb-4 ${
            isPopular
              ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black"
              : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
          } font-semibold text-lg h-12 transition-all duration-300`}
        >
          {isLoading ? (
            <>
              <Zap className="w-5 h-5 mr-2 animate-spin" />
              {t("subscription.pricing.processing")}
            </>
          ) : (
            `${t("subscription.pricing.startFreeTrial")} (${productName})`
          )}
        </Button>
        <p className="text-sm text-gray-500">
          {t("subscription.pricing.cancelAnytime")}
        </p>
      </CardContent>
    </Card>
  );
}
