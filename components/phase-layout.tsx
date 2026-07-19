"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type PhaseTheme = "downtime" | "starting" | "uptime" | "default";

interface PhaseLayoutProps {
  theme?: PhaseTheme;
  className?: string;
  children: React.ReactNode;
}

const themeStyles: Record<PhaseTheme, { bgClass: string; inlineStyle?: React.CSSProperties }> = {
  downtime: {
    bgClass: "bg-[#020617] text-slate-100",
    inlineStyle: {
      backgroundImage: `
        radial-gradient(circle at 50% 20%, rgba(255, 42, 85, 0.15) 0%, transparent 60%),
        radial-gradient(circle at 50% 85%, rgba(159, 18, 57, 0.10) 0%, transparent 50%),
        linear-gradient(to right, rgba(255, 42, 85, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 42, 85, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: "100% 100%, 100% 100%, 60px 60px, 60px 60px",
    },
  },
  starting: {
    bgClass: "bg-[#020617] text-cyan",
    inlineStyle: {
      backgroundImage: `
        radial-gradient(circle at 50% 25%, oklch(0.4 0.15 200 / 15%) 0%, transparent 60%),
        radial-gradient(circle at 50% 100%, oklch(0.78 0.16 195 / 12%) 0%, transparent 50%)
      `,
    },
  },
  uptime: {
    bgClass: "bg-[#020617] text-slate-100",
    inlineStyle: {
      backgroundImage: `
        radial-gradient(circle at 50% 25%, oklch(0.4 0.15 200 / 15%) 0%, transparent 60%),
        radial-gradient(circle at 50% 100%, oklch(0.78 0.16 195 / 12%) 0%, transparent 50%)
      `,
    },
  },
  default: {
    bgClass: "bg-[#020617] text-foreground",
  },
};

export default function PhaseLayout({
  theme = "downtime",
  className,
  children,
}: PhaseLayoutProps) {
  const currentTheme = themeStyles[theme] || themeStyles.default;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 w-full h-dvh overflow-hidden flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans select-none",
        currentTheme.bgClass,
        className
      )}
      style={currentTheme.inlineStyle}
    >
      {children}
    </div>
  );
}
