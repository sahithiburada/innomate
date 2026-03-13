"use client";

import { useState, useRef } from "react";
import { Info } from "lucide-react";

export default function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    // Decide whether to open upward or downward based on space above
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setPosition(rect.top > 120 ? "top" : "bottom");
    }
    setVisible(true);
  };

  return (
    <div
      ref={wrapRef}
      className="it-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      <style>{CSS}</style>

      {/* Trigger button */}
      <div className="it-trigger">
        <Info size={13} color="#94a3b8" />
      </div>

      {/* Floating tooltip */}
      {visible && (
        <div className={`it-tooltip it-tooltip--${position}`}>
          <div className={`it-arrow it-arrow--${position}`} />
          {text}
        </div>
      )}
    </div>
  );
}

const CSS = `
  .it-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  /* ── Trigger ── */
  .it-trigger {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .it-wrap:hover .it-trigger {
    background: #ede9fe;
    border-color: #ddd6fe;
  }
  .it-wrap:hover .it-trigger svg {
    color: #7c3aed !important;
  }

  /* ── Tooltip bubble ── */
  .it-tooltip {
    position: absolute;
    right: 0;
    z-index: 9999;
    width: 220px;
    background: #0f172a;
    color: #f1f5f9;
    font-size: 11.5px;
    font-weight: 400;
    line-height: 1.65;
    padding: 9px 12px;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    pointer-events: none;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.01em;
    white-space: normal;
    word-break: break-word;
  }

  /* Opens upward */
  .it-tooltip--top {
    bottom: calc(100% + 8px);
  }

  /* Opens downward */
  .it-tooltip--bottom {
    top: calc(100% + 8px);
  }

  /* ── Arrow ── */
  .it-arrow {
    position: absolute;
    right: 6px;
    width: 0;
    height: 0;
  }

  .it-arrow--top {
    bottom: -5px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #0f172a;
  }

  .it-arrow--bottom {
    top: -5px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #0f172a;
  }
`;