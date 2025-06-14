"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Add redirecting state for better UX
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 4);
  };

  // Email validation
  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Get password strength label and color
  const getPasswordStrengthInfo = (strength: number) => {
    const info = [
      { label: "Very Weak", color: "bg-red-500", textColor: "text-red-600" },
      { label: "Weak", color: "bg-orange-500", textColor: "text-orange-600" },
      { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-600" },
      { label: "Good", color: "bg-blue-500", textColor: "text-blue-600" },
      { label: "Strong", color: "bg-green-500", textColor: "text-green-600" },
    ];
    return info[strength] || info[0];
  };

  // Check URL params for tab switching
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated - Centralized in AuthProvider
  useEffect(() => {
    if (user && !authLoading && !isRedirecting) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[AuthPageContent] User authenticated, redirecting to: ${redirectTo}`
        );
      }

      setIsRedirecting(true);

      // Force a router refresh and then redirect
      router.refresh();

      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 100);
    }
  }, [user, authLoading, router, searchParams, isRedirecting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (name === "email") {
      setEmailValid(value.length > 0 ? validateEmailFormat(value) : null);
    }

    if (name === "password") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!validateEmailFormat(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        setError("Full name is required");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      // Require stronger password for registration
      if (passwordStrength < 2) {
        setError("Please choose a stronger password");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          // Handle authentication error gracefully - this is expected user behavior, not a system error
          setError(result.error);
          setIsLoading(false);
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[AuthPageContent] Login successful, user state will be updated by AuthProvider`
          );
        }

        // Don't redirect here - let the useEffect handle it after user state updates
        // This prevents race conditions
      } else {
        const result = await signUp(
          formData.email,
          formData.password,
          formData.fullName
        );
        if (result.error) {
          // Handle registration error gracefully - this is expected user behavior, not a system error
          setError(result.error);
          setIsLoading(false);
          return;
        }
        setSuccess(
          "Account created successfully! Please check your email to verify your account."
        );
        // Switch to login tab
        setIsLogin(true);
        setFormData({
          fullName: "",
          email: formData.email, // Keep email for convenience
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      // Only log actual system/network errors, not user validation errors
      console.error("System error during authentication:", error);
      setError("A system error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError(null);
    setSuccess(null);
    setEmailValid(null);
    setPasswordStrength(0);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Update URL
    const params = new URLSearchParams();
    if (!loginMode) {
      params.set("tab", "register");
    }
    router.replace(`/auth${params.toString() ? `?${params.toString()}` : ""}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show redirecting state when user exists and we're redirecting
  if (user || isRedirecting) {
    const redirectTo = searchParams.get("redirect") || "/dashboard";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to{" "}
            {redirectTo === "/dashboard" ? "dashboard" : "your destination"}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md px-4">
        {/* App Branding */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">D</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            FeedAgg
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Your intelligent content companion
          </p>
        </div>

        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              {isLogin
                ? "Sign in to continue to your dashboard"
                : "Join thousands of users managing their content"}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    required
                    className="h-11 transition-colors focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    required
                    className={`h-11 pr-10 transition-colors focus:border-teal-500 focus:ring-teal-500 ${
                      emailValid === false
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : emailValid === true
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                        : ""
                    }`}
                  />
                  {formData.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailValid === true ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ) : emailValid === false ? (
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                {emailValid === false && formData.email && (
                  <p className="text-xs text-red-600 mt-1">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
                    minLength={8}
                    className="h-11 pr-10 transition-colors focus:border-teal-500 focus:ring-teal-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!isLogin && formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        Password strength:
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          getPasswordStrengthInfo(passwordStrength).textColor
                        }`}
                      >
                        {getPasswordStrengthInfo(passwordStrength).label}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level < passwordStrength
                              ? getPasswordStrengthInfo(passwordStrength).color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength < 3 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Use 8+ characters with uppercase, lowercase, numbers,
                        and symbols
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      required
                      minLength={8}
                      className={`h-11 pr-10 transition-colors focus:border-teal-500 focus:ring-teal-500 ${
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : formData.confirmPassword &&
                            formData.password === formData.confirmPassword
                          ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                          : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <p className="text-xs text-green-600 mt-1">
                        Passwords match
                      </p>
                    )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              {isLogin && (
                <Button
                  variant="ghost"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={isLoading}
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                >
                  Forgot your password?
                </Button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                    {isLogin ? "New to FeedAgg?" : "Already have an account?"}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => switchMode(!isLogin)}
                disabled={isLoading}
                className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium"
              >
                {isLogin ? "Create your account" : "Sign in instead"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ForgotPasswordDialog
          open={showForgotPassword}
          onOpenChange={setShowForgotPassword}
        />
      </div>
    </div>
  );
}
