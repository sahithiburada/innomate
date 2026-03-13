"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function IdeaReportPage() {
  const params = useParams();
  const ideaId = params.id as string;

  const [ideaData, setIdeaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ideaId) return;

    const fetchIdea = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/idea/${ideaId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch idea");
        }

        const data = await response.json();
        setIdeaData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!ideaData || ideaData.error) {
    return <div className="p-10">Idea not found</div>;
  }

  const summary = ideaData.summary;

  return (
    <div className="p-10 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        {summary.suggested_title}
      </h1>

      <p className="mb-4 text-gray-700">
        {summary.abstract_context}
      </p>

      <div className="mb-4">
        <strong>Domain:</strong> {summary.domain}
      </div>

      <div className="mb-4">
        <strong>Target Audience:</strong> {summary.target_audience}
      </div>

      <div className="mt-6 text-lg">
        {summary.summarized_idea}
      </div>

    </div>
  );
}