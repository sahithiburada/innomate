"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthLayout from "@/src/components/AuthLayout";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // ✅ FIX 1: Exchange the token from the email link for a valid session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          // Session is now established from the email link token
          setSessionReady(true);
        }
      }
    );

    // Also check if a session already exists (e.g. page refresh)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
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

    if (!sessionReady) {
      setErrorMessage(
        "Session expired or invalid link. Please request a new password reset."
      );
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
    } else {
      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut();
      router.push("/login?passwordUpdated=true");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleUpdate} className="space-y-5 w-full max-w-md">
        <div className="mb-6">
          <Image
            src="/assets/innomate.png"
            alt="Innomate"
            width={28}
            height={28}
            className="mb-4"
          />
          <h1 className="text-3xl font-semibold">Create new password</h1>
          <p className="text-sm text-gray-500 mt-2">
            Choose a strong password for your account.
          </p>
        </div>

        {/* New Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
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

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
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
              <EyeOff size={20} strokeWidth={2.5} />
            ) : (
              <Eye size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Inline Error */}
        {errorMessage && (
          <p className="text-sm text-rose-500 font-medium">{errorMessage}</p>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white rounded-xl py-3 hover:opacity-90 transition"
        >
          Update Password
        </button>
      </form>
    </AuthLayout>
  );
}