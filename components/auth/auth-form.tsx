"use client"
import { useState, type FormEvent, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Chrome, Eye, EyeOff } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { AuthFormData } from "@/types/auth"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    fullName: "",
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInput = (field: keyof AuthFormData) => (e: ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { email, password, fullName } = formData
    const action = mode === "login" ? () => signIn(email, password) : () => signUp(email, password, fullName ?? "")

    const { error } = await action()

    if (error) setError(error.message)
    else if (mode === "login") router.push("/dashboard")
    else alert("Registration successful! Please check your inbox to confirm your email.")

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-3 shadow-lg">
              <img src="/funnel-icon.webp" alt="FeedAgg Icon" className="w-8 h-8 filter brightness-0 invert" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Feed<span className="text-teal-600">Agg</span>
          </h1>
          <p className="text-gray-500 text-sm">Pure content. Zero noise.</p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            {mode === "login" ? "Log in to see more" : "Join FeedAgg today"}
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {mode === "register" && (
            <Input
              type="text"
              placeholder="Full name"
              value={formData.fullName}
              onChange={handleInput("fullName")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
              required
            />
          )}

          <Input
            type="email"
            placeholder="Email or phone number"
            value={formData.email}
            onChange={handleInput("email")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleInput("password")}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
          </Button>
        </form>

        {/* Divider */}
        <div className="text-center mb-4">
          <span className="text-gray-400 text-sm font-medium">OR</span>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          variant="outline"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors mb-6"
        >
          <Chrome className="mr-3 h-5 w-5 text-blue-500" />
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </Button>

        {/* Links Section */}
        <div className="space-y-3 text-center">
          {mode === "login" && (
            <div>
              <Link href="/auth/forgot-password" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="text-sm text-gray-600">
            {mode === "login" ? (
              <>
                Not on FeedAgg yet?{" "}
                <Link href="/auth/register" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
