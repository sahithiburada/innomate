"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthLayout from "@/src/components/AuthLayout";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

// ✅ Maps raw Supabase errors to friendly messages
function getFriendlyError(message: string): string {
  if (message.toLowerCase().includes("rate limit")) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }
  if (message.toLowerCase().includes("already registered") || message.toLowerCase().includes("user already exists")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (message.toLowerCase().includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (message.toLowerCase().includes("password")) {
    return "Password is too weak. Use 8+ characters with uppercase, lowercase, number & symbol.";
  }
  return message;
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must contain 8+ characters, uppercase, lowercase, number & special character."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // ✅ Store name in user metadata
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(getFriendlyError(error.message));
    } else {
      router.push("/login?signedUp=true");
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-5"
        autoComplete="off"
      >
        <div className="mb-6">
          <Image
            src="/assets/innomate.png"
            alt="Innomate"
            width={46}
            height={46}
            className="mb-4"
          />

          <h1 className="text-3xl font-semibold leading-tight">
            Create an account
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Access your insights anytime.
          </p>
        </div>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          autoComplete="new-email"
          className="w-full border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="new-password"
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
              <EyeOff size={22} strokeWidth={2.5} />
            ) : (
              <Eye size={22} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            autoComplete="new-password"
            className="w-full border rounded-xl p-3 pr-12 focus:outline-none focus:ring-1 focus:ring-black"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
          >
            {showConfirmPassword ? (
              <EyeOff size={22} strokeWidth={2.5} />
            ) : (
              <Eye size={22} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* INLINE ERROR */}
        {errorMessage && (
          <div className="bg-red-50 text-rose-600 text-sm px-4 py-3 rounded-xl border border-red-200">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-xl py-3 hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}