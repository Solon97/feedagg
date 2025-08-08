"use client";

import { useState } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { useStripePrices } from "@/hooks/use-stripe-prices";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import { apiService } from "@/lib/api";
import { StripePrice } from "@/types/stripe";
import { PricingCard } from "@/components/pricing-card";
import { Navbar } from "@/components/navbar";

/**
 * Subscribe Page Component
 *
 * This component handles the subscription flow by:
 * 1. Fetching available Stripe pricing plans from /api/stripe/prices
 * 2. Displaying pricing cards with real Stripe data
 * 3. Creating Stripe checkout sessions when users click subscribe
 * 4. Redirecting users to Stripe's hosted checkout
 */
export default function SubscribePage() {
  const { t } = useLocalizedTranslations();
  const {
    prices,
    loading: pricesLoading,
    getYearlyPriceDiscount,
    error,
  } = useStripePrices();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const response = await apiService.createStripeCheckoutSession(priceId);
      if (response.success && response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error(response.error || t("subscription.checkoutError"));
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(t("subscription.checkoutErrorAlert"));
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPopularBadge = (price: StripePrice) => {
    return price.recurring?.interval === "year";
  };

  const premiumFeatures = [
    t("subscription.features.unlimited"),
    t("subscription.features.clean"),
    t("subscription.features.webAccess"),
    t("subscription.features.updates"),
  ];

  if (pricesLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center">
            <Zap className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">{t("subscription.loadingPlans")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{t("subscription.errorLoading")}</p>
            <p className="text-gray-400 text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-50 mb-4">
              {t("subscription.pricing.title")}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t("subscription.pricing.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {prices.map((price) => (
              <PricingCard
                key={price.id}
                price={price}
                yearlyPriceDiscount={getYearlyPriceDiscount()}
                isPopular={getPopularBadge(price)}
                isLoading={checkoutLoading === price.id}
                features={premiumFeatures}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            {/* You can add a Stripe logo here if desired */}
            <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto">
              {t("subscription.security")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
