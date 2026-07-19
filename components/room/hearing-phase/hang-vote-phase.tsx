"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { InGamePlayer } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { ShieldAlert, Eye } from "lucide-react";

interface HangVotePhaseProps {
  players: InGamePlayer[];
  timeLeft: number;
  totalDuration?: number;
  round: number;
  voteValue: string;
  onVote: (id: string) => void;
  isUserAlive: boolean;
}

export default function HangVotePhase({
  players,
  timeLeft,
  round,
  voteValue,
  onVote,
  isUserAlive,
}: HangVotePhaseProps) {
  const formattedTime = timeLeft.toString().padStart(2, "0");
  const isUrgent = timeLeft <= 10;

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

      <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto pt-[70px] pb-4 justify-between h-full">
        <div className="flex flex-col items-center pt-4 gap-2">
          <span className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">
            {isUserAlive ? "CAST YOUR VOTE FOR SUSPECTED ANOMALOUS NODE" : "OBSERVER MODE // DISCONNECTED FROM CASTING"}
          </span>

          <div className="flex items-center gap-4 bg-slate-950/40 border border-cyan/15 rounded-xl px-4 py-2 mt-1">
            <span className="font-mono text-xs tracking-widest text-cyan uppercase">
              HEARING_TIMEOUT
            </span>
            <span className={cn(
              "font-mono font-bold text-xl tracking-[1px]",
              isUrgent ? "text-rose-500" : "text-white"
            )}>
              00:{formattedTime}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center my-auto py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-h-[420px] overflow-y-auto p-1">
            {players.map((player) => {
              const isDead = player.status !== "alive";
              const isSelected = voteValue === player.id;
              
              return (
                <button
                  key={player.id}
                  disabled={isDead || !isUserAlive}
                  onClick={() => onVote(isSelected ? "none" : player.id)}
                  className={cn(
                    "relative flex flex-col justify-between p-4 rounded-2xl border text-left font-mono transition-all duration-300 min-h-[100px]",
                    isDead
                      ? "border-slate-800/40 bg-slate-950/20 opacity-40 cursor-not-allowed"
                      : !isUserAlive
                      ? "border-cyan/10 bg-slate-900/30 cursor-default"
                      : isSelected
                      ? "border-cyan bg-cyan/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan"
                      : "border-cyan/20 bg-slate-950/60 hover:border-cyan/50 hover:bg-slate-900/40 text-slate-300"
                  )}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      NODE_{player.id.substring(0, 4).toUpperCase()}
                    </span>
                    {isDead && (
                      <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded uppercase font-semibold">
                        TERMINATED
                      </span>
                    )}
                    {!isDead && isSelected && (
                      <span className="text-[9px] bg-cyan/20 text-cyan px-1.5 py-0.5 rounded uppercase font-bold">
                        SELECTED
                      </span>
                    )}
                  </div>

                  <span className={cn(
                    "text-base font-semibold tracking-wide truncate mt-4",
                    isDead ? "text-slate-600 line-through" : "text-white"
                  )}>
                    {player.name}
                  </span>
                </button>
              );
            })}

            {isUserAlive && (
              <button
                onClick={() => onVote("none")}
                className={cn(
                  "flex flex-col justify-between p-4 rounded-2xl border text-left font-mono transition-all duration-300 min-h-[100px]",
                  voteValue === "none"
                    ? "border-cyan bg-cyan/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan"
                    : "border-cyan/25 bg-slate-950/60 hover:border-cyan/50 hover:bg-slate-900/40 text-slate-300"
                )}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    SYSTEM_ABSTAIN
                  </span>
                  {voteValue === "none" && (
                    <span className="text-[9px] bg-cyan/20 text-cyan px-1.5 py-0.5 rounded uppercase font-bold">
                      SELECTED
                    </span>
                  )}
                </div>
                <span className="text-base font-semibold tracking-wide mt-4">
                  Abstain / Skip
                </span>
              </button>
            )}
          </div>
        </div>

        {!isUserAlive && (
          <div className="flex items-center justify-center gap-2 bg-slate-950/60 border border-slate-800 p-3 rounded-2xl max-w-sm mx-auto w-full mb-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
              SPECTATING AS TERMINATED NODE
            </span>
          </div>
        )}
      </div>
    </PhaseLayout>
  );
}
