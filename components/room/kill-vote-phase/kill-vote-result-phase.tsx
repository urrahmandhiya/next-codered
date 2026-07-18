"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { InGamePlayer } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { Skull, Loader2, Target, CheckCircle2 } from "lucide-react";

interface KillVoteResultPhaseProps {
  round: number;
  lastDeadPlayer: InGamePlayer | null;
  voterByCandidate: Record<string, string[]>;
  timeLeft: number;
  players: InGamePlayer[];
  isUserBadSide: boolean;
  isUserAlive: boolean;
}

export default function KillVoteResultPhase({
  round,
  lastDeadPlayer,
  voterByCandidate,
  timeLeft,
  players,
  isUserBadSide,
  isUserAlive,
}: KillVoteResultPhaseProps) {
  const hasEliminated = !!lastDeadPlayer;

  const getPlayerName = (id: string) => {
    if (id === "none") return "Stand Down";
    const found = players.find((p) => p.id === id);
    return found ? found.name : id;
  };

  if (isUserBadSide && isUserAlive) {
    return (
      <PhaseLayout theme="downtime">
        <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-rose-500/20 backdrop-blur-md z-50 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-rose-500" />
            <span className="font-mono text-xs tracking-[0.2em] text-rose-500 uppercase opacity-90">
              SILENT PROTOCOL RESULT
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
                ? "bg-[#1e0a10]/50 border-rose-500/25 shadow-[0_0_50px_rgba(239,68,68,0.06)]"
                : "bg-slate-950/60 border-rose-500/10 shadow-[0_0_50px_rgba(239,68,68,0.02)]"
            )}>
              {hasEliminated ? (
                <>
                  <div className="w-16 h-16 rounded-full border border-rose-500/30 bg-rose-500/10 flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-rose-500" />
                  </div>
                  <span className="font-mono text-xs tracking-[0.2em] text-rose-400 font-bold uppercase mb-1">
                    TARGET_ELIMINATED // NODE_DECRYPTED
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-wide mb-2 uppercase">
                    {lastDeadPlayer.name}
                  </h2>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-rose-950/80 border border-rose-500/30 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="font-mono text-xs uppercase tracking-wider text-rose-300">
                      ROLE: {lastDeadPlayer.role}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full border border-rose-500/20 bg-rose-500/5 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-rose-500/60" />
                  </div>
                  <span className="font-mono text-xs tracking-[0.2em] text-rose-400/80 font-bold uppercase mb-1">
                    PROTOCOL_COMPLETE // ABSTAINED
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-wide mb-2 uppercase">
                    NO TARGET TERMINATED
                  </h2>
                  <p className="text-xs text-slate-400 font-mono tracking-wide max-w-sm mt-1">
                    Uplink completed with no active decrypt operations. Target link preserved.
                  </p>
                </>
              )}
            </div>

            {Object.keys(voterByCandidate).length > 0 && (
              <div className="bg-slate-950/40 border border-rose-500/10 rounded-2xl p-5 flex flex-col gap-3 font-mono">
                <span className="text-[10px] tracking-[0.2em] text-slate-500 uppercase border-b border-rose-500/15 pb-2">
                  PROTOCOL_BREAKDOWN
                </span>
                <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto pr-1">
                  {Object.entries(voterByCandidate).map(([votedId, voters]) => (
                    <div key={votedId} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1 border-b border-slate-900/50 last:border-0">
                      <span className="text-rose-400 font-semibold mb-1 sm:mb-0">
                        Targeted {getPlayerName(votedId)}:
                      </span>
                      <span className="text-slate-400 text-[11px] truncate">
                        {voters.map(id => getPlayerName(id)).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-900/40 border border-rose-500/10 p-3.5 rounded-2xl max-w-xs mx-auto w-full">
            <span className="font-mono text-[10px] text-rose-400/70 uppercase tracking-widest">
              PROCEEDING IN
            </span>
            <span className="font-mono text-base font-bold text-white tracking-wider">
              00:{timeLeft.toString().padStart(2, "0")}
            </span>
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
