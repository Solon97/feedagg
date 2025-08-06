"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

/**
 * Subscription Success Page
 *
 * This page is displayed after a successful Stripe checkout.
 * It confirms the subscription and guides the user to their dashboard.
 */
export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate verification delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push("/feeds");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Verifying your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-50 mb-2">
                Welcome to Premium!
              </h1>
              <p className="text-slate-400">
                Your subscription has been activated successfully.
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-2">
                What's included:
              </h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Unlimited content sources</li>
                <li>• Clean, distraction-free feed</li>
                <li>• Web access from any device</li>
                <li>• Access to future updates</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Your Feed
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-6">
              You'll receive a confirmation email shortly with your receipt.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
