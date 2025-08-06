"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

/**
 * Subscription Cancel Page
 *
 * This page is displayed when a user cancels the Stripe checkout process.
 * It offers options to retry or return to the pricing page.
 */
export default function SubscriptionCancelPage() {
  const router = useRouter();

  const handleRetrySubscription = () => {
    router.push("/subscribe");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-50 mb-2">
                Subscription Cancelled
              </h1>
              <p className="text-slate-400">
                Your payment was cancelled. No charges have been made to your
                account.
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-2">
                Still interested in Premium?
              </h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Cancel anytime</li>
                <li>• Unlimited content sources</li>
                <li>• Clean, distraction-free experience</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetrySubscription}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              <p>Need help? Contact our support team.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
