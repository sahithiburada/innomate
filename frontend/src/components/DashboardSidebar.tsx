"use client";

/**
 * Sidebar.tsx  (updated)
 *
 * Changes from original:
 *   1. Added a download (↓) button next to the Trash2 delete button
 *   2. Clicking download → calls POST /api/report/generate/{idea_id}
 *      → receives pdf_url → triggers browser download
 *   3. Shows a loading spinner on the download button while generating
 *   4. Toast confirms success or shows error
 *
 * Everything else is UNCHANGED.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2, Download, Loader2 } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  mobileSidebar: boolean;
  setMobileSidebar: (v: boolean) => void;
  activeId: string | null;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileSidebar,
  setMobileSidebar,
  activeId,
}: SidebarProps) {
  const router = useRouter();
  const confirmRef = useRef<HTMLDivElement | null>(null);

  const [ideas, setIdeas] = useState<any[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ── close confirm bubble on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        confirmRef.current &&
        !confirmRef.current.contains(e.target as Node)
      ) {
        setConfirmingId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── fetch ideas ──
  const fetchIdeas = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/idea/my-ideas`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const result = await res.json();
    setIdeas(result.ideas || []);
  };

  useEffect(() => {
    fetchIdeas();
    window.addEventListener("refresh-history", fetchIdeas);
    return () => window.removeEventListener("refresh-history", fetchIdeas);
  }, []);

  // ── logout ──
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // ── download report ──
  const handleDownload = async (e: React.MouseEvent, ideaId: string) => {
    e.stopPropagation();
    if (downloadingId === ideaId) return;

    setDownloadingId(ideaId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/generate/${ideaId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err?.detail || "Report generation failed";
        showToast(`⚠️ ${message}`);
        return;
      }

      const result = await res.json();
      const pdfUrl: string = result.pdf_url;

      // Trigger browser download via a temporary anchor
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `innomate-report-${ideaId}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("✅ Report downloaded!");
    } catch {
      showToast("⚠️ Something went wrong");
    } finally {
      setDownloadingId(null);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── group ideas by date ──
  const groupedIdeas = ideas.reduce((groups: Record<string, any[]>, idea) => {
    const created = new Date(idea.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label = created.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    if (created.toDateString() === today.toDateString()) label = "Today";
    else if (created.toDateString() === yesterday.toDateString())
      label = "Yesterday";

    if (!groups[label]) groups[label] = [];
    groups[label].push(idea);
    return groups;
  }, {});

  return (
    <aside
      className={`
        fixed md:relative z-50 h-full bg-white border-r border-gray-200
        flex flex-col justify-between p-6 shadow-sm
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "w-64" : "w-20"}
        ${mobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* ── TOP ── */}
      <div>
        <div className="flex items-center justify-between mb-10">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <Image
                src="/assets/innomate.png"
                alt="Innomate"
                width={28}
                height={28}
              />
              <span className="font-semibold text-lg tracking-tight">
                Innomate
              </span>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition"
          >
            <div className="flex flex-col gap-[3px]">
              <span className="w-4 h-[2px] bg-black" />
              <span className="w-4 h-[2px] bg-black" />
              <span className="w-4 h-[2px] bg-black" />
            </div>
          </button>
        </div>

        {/* New Idea button */}
        <button
          onClick={() => {
            router.replace("/dashboard");
            setMobileSidebar(false);
          }}
          className="w-full bg-black text-white rounded-xl py-3 mb-6 hover:opacity-90 transition"
        >
          {sidebarOpen ? "+ New Idea" : "+"}
        </button>

        {/* HISTORY */}
        {sidebarOpen && (
          <div className="text-sm text-gray-400">
            {ideas.length === 0 ? (
              "No ideas yet"
            ) : (
              <div className="space-y-4 text-gray-600">
                {Object.entries(groupedIdeas).map(([label, group]: any) => (
                  <div key={label}>
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                      {label}
                    </div>

                    <div className="space-y-2">
                      {group.map((idea: any) => {
                        const isActive = activeId === idea.id;
                        const isDownloading = downloadingId === idea.id;

                        return (
                          <div
                            key={idea.id}
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (
                                target.closest("button") ||
                                target.closest(".confirm-bubble")
                              )
                                return;
                              if (confirmingId !== idea.id) {
                                router.push(`/dashboard?id=${idea.id}`);
                              }
                            }}
                            className={`group relative flex items-center justify-between w-full text-left transition rounded-md px-2 py-1 cursor-pointer ${
                              isActive
                                ? "bg-gray-200 text-black"
                                : "hover:text-black hover:bg-gray-100"
                            }`}
                          >
                            {/* Idea title */}
                            <span className="flex-1 min-w-0 truncate text-sm">
                              {idea.title}
                            </span>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              {/* ── Download button ── */}
                              <button
                                type="button"
                                title="Download Report"
                                onClick={(e) => handleDownload(e, idea.id)}
                                disabled={isDownloading}
                                className="cursor-pointer text-gray-400 hover:text-indigo-500 transition disabled:opacity-40"
                              >
                                {isDownloading ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin text-indigo-400"
                                  />
                                ) : (
                                  <Download size={14} />
                                )}
                              </button>

                              {/* ── Delete button ── */}
                              <button
                                type="button"
                                title="Delete Idea"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmingId(idea.id);
                                }}
                                className="cursor-pointer text-gray-400 hover:text-red-500 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Delete confirm bubble */}
                            {confirmingId === idea.id && (
                              <div
                                ref={confirmRef}
                                onClick={(e) => e.stopPropagation()}
                                className="confirm-bubble absolute right-0 top-8 bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 flex gap-3 text-xs z-50"
                              >
                                <button
                                  onClick={() => setConfirmingId(null)}
                                  className="text-gray-500 hover:text-black"
                                >
                                  Cancel
                                </button>

                                <button
                                  onClick={async () => {
                                    const { data } =
                                      await supabase.auth.getSession();
                                    const token =
                                      data.session?.access_token;

                                    const response = await fetch(
                                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/idea/${idea.id}`,
                                      {
                                        method: "DELETE",
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    );

                                    if (!response.ok) return;

                                    setIdeas((prev) =>
                                      prev.filter((i) => i.id !== idea.id)
                                    );
                                    setConfirmingId(null);
                                    showToast("Idea deleted");

                                    if (activeId === idea.id) {
                                      router.push("/dashboard");
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── LOGOUT ── */}
      {sidebarOpen && (
        <button
          onClick={handleLogout}
          className="
            flex items-center justify-center gap-2
            w-full rounded-xl py-3 text-sm font-medium
            bg-black text-white
            hover:bg-red-600 hover:border-red-600
            transition-all duration-300
          "
        >
          Logout
        </button>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-5 py-2 rounded-xl shadow-lg z-[9999]">
          {toast}
        </div>
      )}
    </aside>
  );
}