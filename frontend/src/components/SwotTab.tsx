"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import RadialOrbitalTimeline from "@/src/components/ui/radial-orbital-timeline";

export default function SwotTab({ ideaId, acceptedVersion }: any) {

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [openCard, setOpenCard] = useState<string | null>(null);

  useEffect(() => {
    if (!ideaId || !acceptedVersion) return;

    const fetchSwot = async () => {

      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/swot/${ideaId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setData(result.data);
      }

      setLoading(false);
    };

    fetchSwot();

  }, [ideaId, acceptedVersion]);


  if (!acceptedVersion) {
    return (
      <div className="mt-10 text-center text-gray-500">
        Accept an idea version to unlock SWOT Analysis.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-10 text-center text-gray-500">
        Generating SWOT Analysis...
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      key: "Strengths",
      title: "Strengths",
      desc: "Core advantages that give this startup a competitive edge.",
      items: data.Strengths || []
    },
    {
      key: "Weaknesses",
      title: "Weaknesses",
      desc: "Internal limitations that could slow growth or execution.",
      items: data.Weaknesses || []
    },
    {
      key: "Opportunities",
      title: "Opportunities",
      desc: "External factors that could accelerate adoption and growth.",
      items: data.Opportunities || []
    },
    {
      key: "Threats",
      title: "Threats",
      desc: "External risks that may challenge the startup’s success.",
      items: data.Threats || []
    }
  ];

const timelineData = [
{
  id: 1,
  title: "Strengths",
  date: "",
  content: data.Strengths || [],
  category: "Strengths",
  icon: () => <span>S</span>,
  relatedIds: [2,3,4]
},
{
  id: 2,
  title: "Weaknesses",
  date: "",
  content: data.Weaknesses || [],
  category: "Weaknesses",
  icon: () => <span>W</span>,
  relatedIds: [1,3,4]
},
{
  id: 3,
  title: "Opportunities",
  date: "",
  content: data.Opportunities || [],
  category: "Opportunities",
  icon: () => <span>O</span>,
  relatedIds: [1,2,4]
},
{
  id: 4,
  title: "Threats",
  date: "",
  content: data.Threats || [],
  category: "Threats",
  icon: () => <span>T</span>,
  relatedIds: [1,2,3]
}
];

  return (
    <div className="w-full min-h-[650px] flex items-center justify-center">
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  );
}