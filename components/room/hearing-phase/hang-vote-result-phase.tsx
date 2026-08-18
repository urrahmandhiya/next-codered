"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { InGamePlayer } from "@/lib/definitions";
import { ShieldAlert, ShieldX, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityClearanceResultPhaseProps {
  round: number;
  lastDeadPlayer: InGamePlayer | null;
  lastDeadPlayerCause: string;
  timeLeft: number;
}

export default function SecurityClearanceResultPhase({
  round,
  lastDeadPlayer,
  lastDeadPlayerCause,
  timeLeft,
}: SecurityClearanceResultPhaseProps) {
  const hasEliminated = !!lastDeadPlayer;

  return (
    <PhaseLayout theme="uptime">
      <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-cyan/20 backdrop-blur-md z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan" />
          <span className="font-mono text-xs tracking-[0.2em] text-cyan uppercase opacity-90">
            SECURITY CLEARANCE RESULT
          </span>
        </div>
        <span className="font-mono text-xs tracking-widest text-slate-400 uppercase">
          ROUND_{String(round).padStart(2, "0")}
        </span>
      </header>

      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto pt-[80px] pb-6 justify-between h-full">
        <div className="flex-1 flex flex-col justify-center gap-6 my-auto">
          <div className={cn(
            "p-6 md:p-8 rounded-3xl border backdrop-blur-md flex flex-col items-center text-center shadow-lg",
            hasEliminated
              ? "bg-[#1e0a10]/50 border-rose-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]"
              : "bg-slate-950/60 border-cyan/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]"
          )}>
            {hasEliminated ? (
              <>
                <div className="w-16 h-16 rounded-full border border-rose-500/30 bg-rose-500/10 flex items-center justify-center mb-4">
                  <ShieldX className="w-8 h-8 text-rose-500" />
                </div>
                <span className="font-mono text-xs tracking-[0.2em] text-rose-400 font-bold uppercase mb-1">
                  CLEARANCE_DENIED // SUSPECT_TERMINATED
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-wide mb-2 uppercase">
                  {lastDeadPlayer.name}
                </h2>
                <span className="font-mono text-xs tracking-[0.2em] text-rose-400 font-bold uppercase mb-1">
                  CAUSE OF DEATH: {lastDeadPlayerCause}
                </span>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-rose-950/80 border border-rose-500/30 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="font-mono text-xs uppercase tracking-wider text-rose-300">
                    ROLE: {lastDeadPlayer.role}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full border border-cyan/30 bg-cyan/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-cyan" />
                </div>
                <span className="font-mono text-xs tracking-[0.2em] text-cyan font-bold uppercase mb-1">
                  CLEARANCE_GRANTED // CONTINUITY_VERIFIED
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-wide mb-2 uppercase">
                  NONE
                </h2>
                <p className="text-xs text-slate-400 font-mono tracking-wide max-w-sm mt-1">
                  No node was eliminated during this hearing.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 bg-slate-900/40 border border-cyan/10 p-3.5 rounded-2xl max-w-xs mx-auto w-full">
          <span className="font-mono text-[10px] text-cyan/70 uppercase tracking-widest">
            PROCEEDING TO DOWNTIME IN
          </span>
          <span className="font-mono text-base font-bold text-white tracking-wider">
            00:{timeLeft.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </PhaseLayout>
  );
}
