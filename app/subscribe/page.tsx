"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from "lucide-react";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // Here you would integrate with your payment provider (Stripe, etc.)
    // For now, just simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const features = [
    "Unlimited feed subscriptions",
    "Priority feed updates",
    "Advanced filtering options",
    "Export feed items",
    "Premium support",
    "Ad-free experience",
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">
              Upgrade to <span className="text-yellow-400">Premium</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Get the most out of FeedAgg with our premium features
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card className="bg-slate-800 border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500"></div>

            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold">
                  Most Popular
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white">
                Premium Plan
              </CardTitle>
              <CardDescription className="text-gray-400">
                Everything you need for professional feed management
              </CardDescription>
              <div className="flex items-center justify-center gap-1 mt-4">
                <span className="text-4xl font-bold text-white">$9</span>
                <span className="text-gray-400">/month</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <div className="bg-teal-600 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold text-lg h-12"
              >
                {loading ? (
                  <>
                    <Zap className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Cancel anytime. No hidden fees. 30-day money-back guarantee.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ or additional info could go here */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Questions? Contact our support team at{" "}
            <a
              href="mailto:support@feedagg.com"
              className="text-teal-400 hover:text-teal-300"
            >
              support@feedagg.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
