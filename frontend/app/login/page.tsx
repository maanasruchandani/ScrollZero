"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/dashboard");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-5 px-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1">Login to ScrollZero</p>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <Label>Email</Label>
            <Input className="mt-1 bg-white/5 border-white/10" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input className="mt-1 bg-white/5 border-white/10" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
        <p className="text-white/40 text-sm text-center">
          No account? <Link href="/signup" className="text-white underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}