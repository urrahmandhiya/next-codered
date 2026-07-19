"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DowntimeBadPhase from "@/components/room/downtime-phase/downtime-bad-phase";

export default function DevDowntimeBadPhaseUiPage() {
  return (
    <div className="relative w-full h-dvh overflow-hidden">
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dev"
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-rose-500/30 hover:border-rose-500/60 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-500" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      <DowntimeBadPhase phaseDuration={60} />
    </div>
  );
}
