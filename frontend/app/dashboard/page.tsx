"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/src/components/Spinner";
import PageLoader from "@/src/components/PageLoader";
import MarketTrendsTab from "@/src/components/MarketTrendsTab";
import CompetitorTab from "@/src/components/CompetitorTab";
import SwotTab from "@/src/components/SwotTab";
import BadgeTabs from "@/src/components/ui/badge-tabs";
import RiskTab from "@/src/components/RiskTab";
import BudgetTab from "@/src/components/BudgetTab";
import SmartRecommendationTab from "@/src/components/SmartRecommendationTab";

import {
  ThumbsUp,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DashboardPage() {
  const [idea, setIdea] = useState("");
  const [focused, setFocused] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState<any>(null);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [accepting, setAccepting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [activeTab, setActiveTab] = useState("idea");

  const [pageLoading, setPageLoading] = useState(false);

  const searchParams = useSearchParams();
  const ideaId = searchParams.get("id");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  const pastelGradients = [
    "from-pink-100 to-purple-100 text-purple-700",
    "from-blue-100 to-cyan-100 text-blue-700",
    "from-green-100 to-teal-100 text-green-700",
    "from-yellow-100 to-orange-100 text-orange-700",
    "from-indigo-100 to-purple-100 text-indigo-700",
    "from-rose-100 to-pink-100 text-rose-700",
  ];

  const domainGradient =
    preview?.idea_id
      ? pastelGradients[
          preview.idea_id.toString().length % pastelGradients.length
        ]
      : pastelGradients[0];

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const name =
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0];
        setUsername(name);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    // ✅ If no ideaId → we are in "New Idea" mode
    if (!ideaId) {
      setPreview(null);
      setActiveVersionIndex(0);
      return;
    }

    const loadIdea = async () => {
      setPageLoading(true);

      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

      const response = await fetch(
        `${API}/api/idea/${ideaId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const result = await response.json();

        const versions =
          result.analysis_data.idea_analysis.versions;

        setPreview({
          idea_id: result.idea_id,
          versions: versions,
          locked: result.analysis_data.idea_analysis.locked,
          acceptedVersion: result.analysis_data.idea_analysis.accepted_version
        });

        setActiveVersionIndex(
          result.analysis_data.idea_analysis.active_version - 1
        );
      } catch (err) {
        console.error("Error loading idea:", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadIdea();
  }, [ideaId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdea(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const handleSubmit = async () => {
    if (!idea.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

    const response = await fetch(
      `${API}/api/idea/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ idea }),
        }
      );

      const result = await response.json();

      if (result.status === "invalid_input") {
        setError(result.feedback);
        return;
      }

    if (result.status === "success") {
      setPreview(result);
      setActiveVersionIndex(result.versions.length - 1);
      setActiveTab("idea");

      // ✅ Push idea into URL so page switches to idea mode
      router.push(`/dashboard?id=${result.idea_id}`);

      window.dispatchEvent(new Event("refresh-history"));
    }
    } catch {
      setError("Something went wrong while analyzing the idea.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

  await fetch(
    `${API}/api/idea/lock/${preview.idea_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          version_number:
            preview.versions[activeVersionIndex].version,
        }),
      }
    );

    // ⭐ immediately update local state
    setPreview((prev: any) => ({
      ...prev,
      locked: true,
      acceptedVersion: prev.versions[activeVersionIndex].version
    }));

    setAccepting(false);

    window.dispatchEvent(new Event("refresh-history"));

    router.refresh();
  };

  const handleRegenerate = async () => {
    setRegenerating(true);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

  const response = await fetch(
    `${API}/api/idea/regenerate/${preview.idea_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idea }),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      setPreview((prev: any) => ({
        ...prev,
        versions: result.versions
      }));

      setActiveVersionIndex(result.versions.length - 1);
      setActiveTab("idea");
    }

    setRegenerating(false);
  };

  const currentVersion =
    preview?.versions?.[activeVersionIndex]?.summary;
  
  const tabItems = [
  { value: "idea", label: "Idea Analysis" },
  {
    value: "swot",
    label: "SWOT Analysis",
    badge: preview?.acceptedVersion
      ? `V${preview.acceptedVersion}`
      : undefined,
  },
  {
    value: "market",
    label: "Market Trends",
    badge: preview?.acceptedVersion
      ? `V${preview.acceptedVersion}`
      : undefined,
  },
  {
    value: "competitor",
    label: "Competitor Analysis",
    badge: preview?.acceptedVersion
      ? `V${preview.acceptedVersion}`
      : undefined,
  },
  {
  value: "risk",
  label: "Risk & Feasibility",
  badge: preview?.acceptedVersion
    ? `V${preview.acceptedVersion}`
    : undefined,
  },
  {
  value: "budget",
  label: "Budget Insights",
  badge: preview?.acceptedVersion
    ? `V${preview.acceptedVersion}`
    : undefined,
  },
  {
  value: "recommendations",
  label: "Smart Recommendations",
  badge: preview?.acceptedVersion
    ? `V${preview.acceptedVersion}`
    : undefined,
  },
];

  return pageLoading && ideaId ? (
    <PageLoader />
  ) : (
    <div
  className={`relative flex flex-col items-center px-6 bg-white ${
    !ideaId
      ? "h-screen justify-center overflow-hidden"
      : "min-h-screen"
  }`}
>
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* 🔥 EXACT OLD NEW-IDEA DESIGN (DO NOT TOUCH ANYTHING ELSE) */}
{!ideaId && (
  <>
    <div className="text-center mb-12 md:mb-14 max-w-3xl w-full">
      <p className="text-gray-600 text-lg md:text-xl mb-4 tracking-wide font-medium">
        {getGreeting()}
        {username && (
          <span className="text-gray-900 font-semibold">
            {", " + username}
          </span>
        )}
      </p>

      <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
        What’s on{" "}
        <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
          your mind?
        </span>
      </h1>
    </div>

    <div
      className={`w-full max-w-2xl rounded-3xl p-[1px] transition-all duration-300 ${
        focused
          ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-xl"
          : "bg-gray-200"
      }`}
    >
      <div className="bg-white rounded-3xl px-6 md:px-8 py-5 md:py-6 shadow-sm">
        <textarea
          ref={textareaRef}
          placeholder="Describe your startup idea in detail..."
          value={idea}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full resize-none bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base md:text-lg min-h-[55px] md:min-h-[70px]"
        />

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>

    {error && (
      <div className="mt-6 max-w-2xl w-full bg-red-100 text-red-700 p-4 rounded-2xl text-sm">
        {error}
      </div>
    )}
  </>
)}

        { ideaId && preview && currentVersion && (
          <>
            {/* IDEA CARD + VERSION CONTROLS ONLY IN IDEA TAB */}
            {activeTab === "idea" && (
              <>
                <div className="mb-6 w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-gray-200 p-8 relative">
                  <h2 className="text-2xl font-semibold mb-2">
                    {currentVersion.suggested_title}
                  </h2>

                  <div
                    className={`inline-block mb-4 px-3 py-1 text-sm rounded-full bg-gradient-to-r ${domainGradient} font-medium`}
                  >
                    {currentVersion.domain}
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase text-gray-400">
                      Target Users
                    </span>

                    <p className="mt-1 text-gray-700 leading-relaxed">
                      {currentVersion.target_segments?.join(", ")}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400">
                      Summary
                    </span>
                    <p className="mt-1 text-gray-700 leading-relaxed">
                      {currentVersion.summarized_idea}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full max-w-2xl mb-10">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <button
                      onClick={() =>
                        setActiveVersionIndex((prev) =>
                          Math.max(prev - 1, 0)
                        )
                      }
                      disabled={activeVersionIndex === 0}
                      className="hover:text-black disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span>
                      {activeVersionIndex + 1}/{preview.versions.length}
                    </span>

                    <button
                      onClick={() =>
                        setActiveVersionIndex((prev) =>
                          Math.min(prev + 1, preview.versions.length - 1)
                        )
                      }
                      disabled={
                        activeVersionIndex ===
                        preview.versions.length - 1
                      }
                      className="hover:text-black disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-8">
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-black transition disabled:opacity-50"
                      title="Regenerate analysis"
                    >
                      {regenerating ? (
                        <Spinner size={18} />
                      ) : (
                        <RotateCcw size={18} />
                      )}
                    </button>

                    <button
                      onClick={handleAccept}
                      disabled={accepting}
                      className="flex items-center justify-center w-6 h-6 text-green-600 hover:text-green-700 transition disabled:opacity-50"
                      title="Accept and proceed"
                    >
                      {accepting ? (
                        <Spinner size={18} />
                      ) : (
                        <ThumbsUp size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TABS */}
            <div className="w-full max-w-4xl mb-6">

              <BadgeTabs
                items={tabItems}
                active={activeTab}
                onChange={(val: string) => setActiveTab(val)}
              />

            </div>

              {activeTab === "swot" && (
                <SwotTab
                  ideaId={preview.idea_id}
                  acceptedVersion={preview.acceptedVersion}
                />
              )}    
              
              {activeTab === "market" && (
                <MarketTrendsTab
                  ideaId={preview.idea_id}
                  acceptedVersion={preview.acceptedVersion}
                />
              )}

              {activeTab === "competitor" && (
                  <CompetitorTab
                    ideaId={preview.idea_id}
                    acceptedVersion={preview.acceptedVersion}
                  />
              )}

              {activeTab === "risk" && (
                <RiskTab
                  ideaId={preview.idea_id}
                  acceptedVersion={preview.acceptedVersion}
                />
              )}
              {activeTab === "budget" && (
                <BudgetTab
                  ideaId={preview.idea_id}
                />
              )}
              {activeTab === "recommendations" && (
                <SmartRecommendationTab
                  ideaId={preview.idea_id}
                  acceptedVersion={preview.acceptedVersion}
                />
              )}
          </>
        )}
      </div>
    </div>
  );
}