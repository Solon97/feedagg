import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { StripePrice } from "@/types/stripe";

interface PricingCardProps {
  price: StripePrice;
  isPopular: boolean;
  isLoading: boolean;
  features: string[];
  onSubscribe: (priceId: string) => void;
}

const formatCurrency = (unitAmount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100);
};

export function PricingCard({
  price,
  isPopular,
  isLoading,
  features,
  onSubscribe,
}: PricingCardProps) {
  const isAnnual = price.recurring?.interval === "year";

  // Calculate monthly price - if annual, divide by 12
  const monthlyPrice = isAnnual
    ? price.unit_amount / 12 / 100
    : price.unit_amount / 100;

  const annualTotal = isAnnual ? price.unit_amount / 100 : 0;

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
            Save 50%
          </Badge>
        </div>
      )}

      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          {price.product.name}
        </h3>

        <div className="mb-2">
          <span
            className={`text-4xl font-bold ${
              isPopular ? "text-yellow-400" : "text-white"
            }`}
          >
            ${monthlyPrice}
          </span>
          <span className="text-gray-400">/month</span>
        </div>

        <div className="text-sm text-gray-400 mb-6 h-5">
          {isAnnual
            ? `Billed annually at ${formatCurrency(
                annualTotal * 100,
                price.currency
              )}/year`
            : ""}
        </div>

        <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg p-4 mb-6 border border-slate-600">
          <div className="text-lg font-semibold text-white mb-2">
            14-day free trial
          </div>
          <div className="text-gray-300">No credit card required</div>
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
              Processing...
            </>
          ) : (
            `Start Free Trial (${price.product.name})`
          )}
        </Button>

        <p className="text-sm text-gray-500">Cancel anytime. No hidden fees.</p>
      </CardContent>
    </Card>
  );
}

// Helper function to provide descriptions for features
function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    "Unlimited content sources":
      "Add as many RSS feeds and YouTube channels as you like",
    "Clean, distraction-free feed": "Stay focused with a minimal interface",
    "Web access from any device": "No apps or installations needed",
    "Access to future updates": "Enjoy every new feature and improvement",
  };

  return (
    descriptions[feature] || "Premium feature included with your subscription"
  );
}
