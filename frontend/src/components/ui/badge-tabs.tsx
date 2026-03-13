"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BadgeTabItem {
  value: string;
  label: string;
  badge?: string | number;
}

interface BadgeTabsProps {
  items: BadgeTabItem[];
  active: string;
  onChange: (val: string) => void;
  className?: string;
}

export default function BadgeTabs({
  items,
  active,
  onChange,
  className,
}: BadgeTabsProps) {

  const TABS_PER_PAGE = 4;

  const [page, setPage] = React.useState(0);

  const totalPages = Math.ceil(items.length / TABS_PER_PAGE);

  const visibleTabs = items.slice(
    page * TABS_PER_PAGE,
    page * TABS_PER_PAGE + TABS_PER_PAGE
  );

  const next = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const prev = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>

      {/* LEFT ARROW */}

      <button
        onClick={prev}
        disabled={page === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronLeft size={18} />
      </button>

      <Tabs value={active} onValueChange={onChange} className="flex-1">

        <TabsList className="flex gap-2 p-2 rounded-xl border bg-white w-full justify-between">

          {visibleTabs.map((item) => {

            const isActive = item.value === active;

            return (
              <TabsTrigger key={item.value} value={item.value} asChild>
                <motion.button
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-lg z-0 bg-gradient-to-r from-[#eda1e3]/90 via-[#b19de7]/90 to-[#f6c6a6]/90"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}

                  <span className="relative z-10 whitespace-nowrap">
                    {item.label}
                  </span>

                  <AnimatePresence>
                    {item.badge && (
                      <motion.span
                        className="relative z-10 text-xs bg-white/30 backdrop-blur px-2 py-0.5 rounded-full text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>

                </motion.button>
              </TabsTrigger>
            );
          })}

        </TabsList>

      </Tabs>

      {/* RIGHT ARROW */}

      <button
        onClick={next}
        disabled={page === totalPages - 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>

    </div>
  );
}