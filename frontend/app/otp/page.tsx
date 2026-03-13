"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("2fa_email");

    if (!storedEmail) {
      router.push("/login");
      return;
    }

    setEmail(storedEmail);

    // Send OTP automatically when page loads
    supabase.auth.signInWithOtp({
      email: storedEmail,
    });
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      alert("Invalid OTP");
    } else {
      localStorage.removeItem("2fa_email");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">
          Enter OTP
        </h1>

        <input
          type="text"
          placeholder="6-digit OTP"
          className="w-full border p-3 rounded-lg"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}
