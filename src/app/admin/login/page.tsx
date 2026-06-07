"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginSchema } from "@/lib/schema";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate with Zod
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError, data: authData } =
      await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

    if (authError) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    // Set server session cookies so middleware/server routes see the session
    try {
      const callbackRes = await fetch("/api/auth/callback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: authData?.session?.access_token,
          refresh_token: authData?.session?.refresh_token,
        }),
      });
      if (!callbackRes.ok) {
        throw new Error("Failed to set session cookies");
      }
    } catch (e) {
      setError("Session setup failed. Please try again.");
      console.error("Failed to set server session", e);
      setLoading(false);
      return;
    }

    // Use user data from auth response (already authenticated)
    const user = authData?.user;
    if (!user) {
      setError("Authentication failed");
      setLoading(false);
      return;
    }

    // Check admin role from users table
    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError("Could not verify admin access");
        setLoading(false);
        return;
      }

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("You do not have admin access");
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("Admin role check failed:", e);
      setError("Admin verification failed");
      setLoading(false);
      return;
    }

    // Navigation should now succeed with valid session
    await router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          <span className="font-bold text-lg text-gray-900">Carefinder</span>
          <span className="text-gray-400 text-sm ml-1">Admin</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
        <p className="text-gray-500 text-sm mb-6">
          Admin access only. Contact your administrator if you need access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@carefinder.ng"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
