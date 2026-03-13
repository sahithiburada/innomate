"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

interface TimelineItem {
  id: number;
  title: string;
  date?: string;
  content: string[];
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {

      const newState: Record<number, boolean> = {};

      Object.keys(prev).forEach((key) => {
        newState[parseInt(key)] = false;
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setAutoRotate(false);
        centerViewOnNode(id);
      } else {
        setAutoRotate(true);
      }

      return newState;

    });
  };

  useEffect(() => {

    let rotationTimer: NodeJS.Timeout;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => (prev + 0.3) % 360);
      }, 50);
    }

    return () => clearInterval(rotationTimer);

  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {

    if (!nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;

    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);

  };

  const calculateNodePosition = (index: number, total: number) => {

    const angle = ((index / total) * 360 + rotationAngle) % 360;

    const radius = 210;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));

    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, zIndex, opacity };

  };

  return (

    <div
      className="
      w-full h-[650px] flex items-center justify-center overflow-hidden relative"   
  ref={containerRef}
      onClick={() => {
        setExpandedItems({});
        setAutoRotate(true);
      }}
    >

      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">

        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
        >

          {/* CENTER NODE */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 animate-pulse flex items-center justify-center shadow-xl">

            <div className="absolute w-20 h-20 rounded-full border border-purple-200 animate-ping opacity-60"></div>

            <div className="w-8 h-8 rounded-full bg-white/80"></div>

          </div>

          {/* ORBIT RING */}
          <div
              className="absolute w-96 h-96 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #a78bfa, #60a5fa, #2dd4bf, #f472b6, #a78bfa)",
                WebkitMask:
                  "radial-gradient(circle, transparent 49.3%, black 49.7%, black 50.3%, transparent 50.7%)",
                mask:
                  "radial-gradient(circle, transparent 49.3%, black 49.7%, black 50.3%, transparent 50.7%)",
                boxShadow:
                  "0 0 25px rgba(167,139,250,0.35), 0 0 40px rgba(96,165,250,0.25)",
              }}
            ></div>

          {timelineData.map((item, index) => {

            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (

              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >

                {/* NODE */}
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  bg-white text-gray-800
                  border border-gray-200
                  shadow-md
                  transition-all duration-300
                  hover:scale-125
                  hover:bg-gradient-to-r
                  hover:from-purple-400
                  hover:via-blue-400
                  hover:to-teal-400
                  hover:text-white
                  hover:shadow-[0_0_18px_rgba(124,58,237,0.5)]
                  ${isExpanded ? "scale-150 shadow-xl bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 text-white" : ""}
                  `}
                >
                  <Icon size={16} />
                </div>

                {/* LABEL */}
                <div
                  className={`absolute top-14 whitespace-nowrap text-xs font-semibold text-gray-600 transition-all ${
                    isExpanded ? "scale-125 text-gray-900" : ""
                  }`}
                >
                  {item.title}
                </div>

                {isExpanded && (

                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-white border border-gray-200 shadow-xl">

                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-gray-300"></div>

                    <CardHeader className="pb-2">

                      <div className="flex justify-between items-center">

                        <CardTitle className="text-sm">
                          {item.title}
                        </CardTitle>

                        <span className="text-xs text-gray-400 font-mono">
                          {item.date || ""}
                        </span>

                      </div>

                    </CardHeader>

                    <CardContent className="text-sm text-gray-600">

                      <ul className="space-y-1">

                        {item.content.map((point, i) => (
                          <li key={i}>• {point}</li>
                        ))}

                      </ul>

                      {/* RELATED */}
                      {item.relatedIds.length > 0 && (

                        <div className="mt-4 pt-3 border-t border-gray-200">

                          <div className="flex items-center mb-2 text-xs text-gray-500">

                            <Link size={10} className="mr-1" />
                            CONNECTED

                          </div>

                          <div className="flex flex-wrap gap-2">

                            {item.relatedIds.map((relatedId) => {

                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId
                              );

                              return (

                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="
                                    text-xs h-6 px-2
                                    border border-gray-200
                                    bg-white
                                    hover:bg-gradient-to-r
                                    hover:from-purple-200
                                    hover:to-blue-200
                                    hover:border-purple-300
                                    transition-all
                                    "
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={10} className="ml-1" />
                                </Button>

                              );

                            })}

                          </div>

                        </div>

                      )}

                    </CardContent>

                  </Card>

                )}

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

}