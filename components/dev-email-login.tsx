"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DevEmailLogin() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signInWithPassword(email, password);
    if (error) setError(error.message || "Login failed");
    setLoading(false);
  };

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] rounded-xl border border-slate-700/50 bg-slate-900/90 backdrop-blur p-4 text-slate-200 shadow-lg">
      <h3 className="text-sm font-semibold mb-2">Dev Login (email/senha)</h3>
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription className="text-red-100 text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-2">
        <Input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-400"
          required
        />
        <Input
          type="password"
          placeholder="senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-400"
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
