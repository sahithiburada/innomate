"use client";

import { useEffect, useRef } from "react";
import TypingText from "./TypingText";

export default function AuthMeshPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      container.style.setProperty("--x", `${x}%`);
      container.style.setProperty("--y", `${y}%`);
    };

    container?.addEventListener("mousemove", handleMouseMove);

    return () => {
      container?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
        <div
        ref={containerRef}
        className="relative w-full h-full rounded-3xl overflow-hidden"
        style={{
            background: `
            radial-gradient(circle at var(--x, 50%) var(--y, 50%), 
                #fec5cb 0%, 
                #f2bcf7 25%, 
                #ffffff 60%
            )
            `,
        }}
        >
      <div className="relative z-10 h-full flex flex-col justify-center px-16">
        <h2 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          Innomate.
          <br />
          From Idea to Insight
        </h2>

        <TypingText />
      </div>
    </div>
  );
}
