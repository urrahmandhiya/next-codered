"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { InGamePlayer } from "@/lib/definitions";
import { AlertCircle, User } from "lucide-react";

interface IncidentReportPhaseProps {
  round: number;
  killDeadPlayer: InGamePlayer | null;
  timeLeft: number;
}

export default function IncidentReportPhase({
  round,
  killDeadPlayer,
  timeLeft,
}: IncidentReportPhaseProps) {
  const formattedTime = timeLeft.toString().padStart(2, "0");

  return (
    <PhaseLayout theme="uptime">
      <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-cyan/20 backdrop-blur-md z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-cyan" />
          <span className="font-mono text-xs tracking-[0.2em] text-cyan uppercase opacity-90">
            INCIDENT REPORT
          </span>
        </div>
        <span className="font-mono text-xs tracking-widest text-slate-400 uppercase">
          ROUND_{String(round).padStart(2, "0")}
        </span>
      </header>

      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto pt-[80px] pb-6 justify-between h-full">
        <div className="flex-1 flex flex-col justify-center my-auto">
          <div className="bg-slate-950/70 border border-cyan/15 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-cyan/20 pb-4 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                <span className="text-xs text-slate-300 font-semibold tracking-wider">
                  DOWNTIME_ATTACK_SUMMARY
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                VERDICT_FINALIZED
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                NODE COMPROMISE REPORT
              </span>
              {killDeadPlayer ? (
                <div className="flex items-center gap-4 bg-[#1e0a10]/30 border border-rose-500/10 rounded-xl p-5">
                  <User className="w-6 h-6 text-rose-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-base text-slate-200 font-bold truncate">
                      {killDeadPlayer.name}
                    </p>
                    <p className="font-mono text-xs text-rose-500 uppercase mt-1">
                      Target Compromised & Terminated. Role: {killDeadPlayer.role}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/20 border border-cyan/5 rounded-xl p-5 text-center">
                  <p className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                    Radio silence maintained. No nodes were compromised during downtime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 bg-slate-900/40 border border-cyan/10 p-3.5 rounded-2xl max-w-xs mx-auto w-full">
          <span className="font-mono text-[10px] text-cyan/70 uppercase tracking-widest">
            RESUMING SYSTEM IN
          </span>
          <span className="font-mono text-base font-bold text-white tracking-wider">
            00:{formattedTime}
          </span>
        </div>
      </div>
    </PhaseLayout>
  );
}
