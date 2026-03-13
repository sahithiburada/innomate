"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/src/components/DashboardSidebar";
import PageLoader from "@/src/components/PageLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // ✅ ONLY auth loading handled here
  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen flex bg-white relative overflow-hidden">

      {/* ===== Mobile Overlay ===== */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileSidebar={mobileSidebar}
        setMobileSidebar={setMobileSidebar}
        activeId={activeId}
      />

      {/* ===== Main Content ===== */}
      <main className="flex-1 overflow-y-auto relative">

        {/* Top Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-4">
          <button
            onClick={() => setMobileSidebar(true)}
            className="text-2xl"
          >
            ☰
          </button>
          <span className="font-semibold">Innomate</span>
        </div>

        {children}
      </main>
    </div>
  );
}
