"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { ShieldAlert, Loader2 } from "lucide-react";

interface HangVoteCountPhaseProps {
  round: number;
}

export default function HangVoteCountPhase({ round }: HangVoteCountPhaseProps) {
  return (
    <PhaseLayout theme="uptime">
      <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-cyan/20 backdrop-blur-md z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan" />
          <span className="font-mono text-xs tracking-[0.2em] text-cyan uppercase opacity-90">
            SECURITY CLEARANCE HEARING
          </span>
        </div>
        <span className="font-mono text-xs tracking-widest text-slate-400 uppercase">
          ROUND_{String(round).padStart(2, "0")}
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
        <div className="w-20 h-20 rounded-full border border-cyan/20 flex items-center justify-center relative overflow-hidden bg-cyan/5 mb-6 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          <Loader2 className="w-8 h-8 text-cyan animate-spin" />
        </div>
        <h2 className="text-2xl font-bold font-mono text-cyan tracking-widest uppercase mb-3 text-glow-cyan">
          TABULATING CLEARANCE VOTES
        </h2>
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
          Running consensus logic. Wait for decryption verdict...
        </p>
      </div>
    </PhaseLayout>
  );
}
