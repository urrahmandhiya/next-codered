"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { InGamePlayer } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { Skull, Loader2 } from "lucide-react";

interface KillVotePhaseProps {
  players: InGamePlayer[];
  timeLeft: number;
  totalDuration?: number;
  round: number;
  voteValue: string;
  onVote: (id: string) => void;
  isUserBadSide: boolean;
  isUserAlive: boolean;
}

export default function KillVotePhase({
  players,
  timeLeft,
  round,
  voteValue,
  onVote,
  isUserBadSide,
  isUserAlive,
}: KillVotePhaseProps) {
  const formattedTime = timeLeft.toString().padStart(2, "0");
  const isUrgent = timeLeft <= 5;

  const targets = players.filter((p) => p.side !== "bad" && p.status === "alive");

  if (isUserBadSide && isUserAlive) {
    return (
      <PhaseLayout theme="downtime">
        <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-rose-500/20 backdrop-blur-md z-50 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-rose-500" />
            <span className="font-mono text-xs tracking-[0.2em] text-rose-500 uppercase opacity-90">
              SILENT PROTOCOL // TARGET SELECTION
            </span>
          </div>
          <span className="font-mono text-xs tracking-widest text-slate-400 uppercase">
            ROUND_{String(round).padStart(2, "0")}
          </span>
        </header>

        <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto pt-[70px] pb-4 justify-between h-full">
          <div className="flex flex-col items-center pt-4 gap-2">
            <span className="font-mono text-[10px] tracking-[0.25em] text-rose-400/80 uppercase">
              COVERT DECISION // INFILTRATE & TERMINATE TARGET
            </span>
            <div className="flex items-center gap-4 bg-slate-950/40 border border-rose-500/15 rounded-xl px-4 py-2 mt-1">
              <span className="font-mono text-xs tracking-widest text-rose-400 uppercase">
                UPLINK_TIMEOUT
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
              {targets.map((player) => {
                const isSelected = voteValue === player.id;

                return (
                  <button
                    key={player.id}
                    onClick={() => onVote(isSelected ? "none" : player.id)}
                    className={cn(
                      "flex flex-col justify-between p-4 rounded-2xl border text-left font-mono transition-all duration-300 min-h-[100px]",
                      isSelected
                        ? "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)] text-rose-500"
                        : "border-rose-500/20 bg-slate-950/60 hover:border-rose-500/50 hover:bg-slate-900/40 text-slate-300"
                    )}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">
                        TARGET_{player.id.substring(0, 4).toUpperCase()}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded uppercase font-bold">
                          ARMED
                        </span>
                      )}
                    </div>
                    <span className="text-base font-semibold tracking-wide truncate mt-4">
                      {player.name}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => onVote("none")}
                className={cn(
                  "flex flex-col justify-between p-4 rounded-2xl border text-left font-mono transition-all duration-300 min-h-[100px]",
                  voteValue === "none"
                    ? "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)] text-rose-500"
                    : "border-rose-500/25 bg-slate-950/60 hover:border-rose-500/50 hover:bg-slate-900/40 text-slate-300"
                )}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    SYSTEM_ABSTAIN
                  </span>
                  {voteValue === "none" && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded uppercase font-bold">
                      ARMED
                    </span>
                  )}
                </div>
                <span className="text-base font-semibold tracking-wide mt-4">
                  Stand Down / Skip
                </span>
              </button>
            </div>
          </div>
        </div>
      </PhaseLayout>
    );
  }

  return (
    <PhaseLayout theme="downtime">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
        <div className="w-16 h-16 rounded-full border border-rose-500/15 flex items-center justify-center relative overflow-hidden bg-rose-500/5 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
          <Loader2 className="w-7 h-7 text-rose-500/70 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold font-mono text-rose-500/90 tracking-widest uppercase mb-3">
          AWAITING SYSTEM RESTORE
        </h2>
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
          Silent state active. Reconnecting node link coordinates.
        </p>
      </div>
    </PhaseLayout>
  );
}
