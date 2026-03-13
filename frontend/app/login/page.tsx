"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/src/components/AuthLayout";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };
    checkUser();

    // ✅ FIX 2: Show success message after password reset
    if (searchParams.get("passwordUpdated") === "true") {
      setSuccessMessage("Password updated successfully! Please log in.");
    }
  }, [router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <AuthLayout>
      {/* ✅ FIX 2: autocomplete="off" prevents browser autofilling old credentials */}
      <form
        onSubmit={handleLogin}
        className="space-y-5 w-full max-w-md"
        autoComplete="off"
      >
        {/* Logo + Title */}
        <div className="mb-6">
          <Image
            src="/assets/innomate.png"
            alt="Innomate"
            width={28}
            height={28}
            className="mb-4"
          />
          <h1 className="text-3xl font-semibold">Log in to your account</h1>
        </div>

        {/* Success message (after password reset) */}
        {successMessage && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200">
            {successMessage}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          autoComplete="new-email" // ✅ Prevents browser autofill
          className="w-full border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="new-password" // ✅ Prevents browser autofill
            className="w-full border rounded-xl p-3 pr-12 focus:outline-none focus:ring-1 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
          >
            {showPassword ? (
              <EyeOff size={20} strokeWidth={2.5} />
            ) : (
              <Eye size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-black transition"
          >
            Forgot password?
          </Link>
        </div>

        {/* Inline Error */}
        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-xl py-3 hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* Bottom Link */}
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-purple-600">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}