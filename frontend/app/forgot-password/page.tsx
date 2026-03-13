"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/src/components/AuthLayout";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) {
      alert(error.message);
    } else {
      setMessage("Password reset link sent! Check your email.");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleReset} className="space-y-5">

        <div className="mb-6">
          <Image
            src="/assets/innomate.png"
            alt="Innomate"
            width={28}
            height={28}
            className="mb-4"
          />

          <h1 className="text-3xl font-semibold">
            Reset your password
          </h1>
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white rounded-xl py-3 hover:opacity-90 transition"
        >
          Send Reset Link
        </button>

        {message && (
          <p className="text-sm text-green-600">{message}</p>
        )}

        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-purple-600">
            Log in
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}
