"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import Navbar from "@/src/components/Navbar";
import Hero from "@/src/components/Hero";
import About from "@/src/components/About";
import FeaturesGrid from "@/src/components/FeaturesGrid";
import Footer from "@/src/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/dashboard"); // redirect if logged in
      } else {
        setCheckingSession(false); // show landing page
      }
    };

    checkSession();
  }, [router]);

  // ⛔ Prevent flashing landing page before redirect
  if (checkingSession) return null;

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <FeaturesGrid />
      <Footer />
    </>
  );
}
