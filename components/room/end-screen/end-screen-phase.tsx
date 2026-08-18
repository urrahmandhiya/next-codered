"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { InGamePlayer } from "@/lib/definitions";
import { ShieldCheck, ShieldAlert, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface EndScreenPhaseProps {
  endGame: string;
  round: number;
  players: InGamePlayer[];
  onReturnToLobby: () => void;
}

export default function EndScreenPhase({
  endGame,
  round,
  players,
  onReturnToLobby,
}: EndScreenPhaseProps) {
  const isGoodSideVictory = endGame === "goodEnd";
  const isRoundLimitExceeded = endGame === "drawEnd";

  return (
    <PhaseLayout theme={(isGoodSideVictory || isRoundLimitExceeded) ? "starting" : "downtime"}>
      <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto pt-[60px] pb-6 justify-between h-full">
        <div className="flex-1 flex flex-col justify-center items-center gap-6 my-auto">
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-20 h-20 rounded-full border flex items-center justify-center mb-4 shadow-lg",
              (isGoodSideVictory || isRoundLimitExceeded)
                ? "border-cyan/40 bg-cyan/10 text-cyan shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                : "border-rose-500/40 bg-rose-500/10 text-rose-500 shadow-[0_0_30px_rgba(255,42,85,0.15)]"
            )}>
              <ShieldAlert className="w-10 h-10" />
            </div>

            <span className="font-mono text-xs tracking-[0.25em] text-slate-400 uppercase">
              GAME OPERATION FINALIZED
            </span>
            <h1 className={cn(
              "text-4xl md:text-5xl font-extrabold tracking-widest mt-2 uppercase",
              (isGoodSideVictory || isRoundLimitExceeded) ? "text-cyan text-glow-cyan" : "text-rose-500 drop-shadow-[0_0_15px_rgba(255,42,85,0.4)]"
            )}>
              {isRoundLimitExceeded ? "MUTUAL TERMINATION" : isGoodSideVictory ? "NETWORK SECURED" : "SYSTEM COMPROMISED"}
            </h1>
            <p className="font-mono text-[11px] text-slate-500 tracking-wider mt-2">
              {isRoundLimitExceeded ? `ROUND LIMIT EXCEEDED ${round}/${round}` : `COMPLETED IN ${round} OPERATIONAL ROUNDS`}
            </p>
          </div>

          <div className="w-full max-w-2xl bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 md:p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 font-mono text-[10px] tracking-wider text-slate-500">
              <span>ACTIVE_NODES_SUMMARY</span>
              <span>CLASSIFIED_ROLES</span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
              {players.map((player) => {
                const isDead = player.status !== "alive";
                const isBadSide = player.side === "bad";

                return (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border font-mono text-sm",
                      isDead
                        ? "border-slate-900/60 bg-slate-950/20 opacity-50"
                        : "border-slate-800/80 bg-slate-900/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        isDead ? "bg-slate-700" : isBadSide ? "bg-rose-500" : "bg-cyan"
                      )} />
                      <span className={cn(
                        "font-semibold",
                        isDead ? "text-slate-500 line-through" : "text-white"
                      )}>
                        {player.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded",
                        isDead ? "bg-slate-900 text-slate-500" : isBadSide ? "bg-rose-950/60 border border-rose-500/20 text-rose-400" : "bg-cyan/10 border border-cyan/20 text-cyan"
                      )}>
                        {player.role}
                      </span>
                      <span className="text-[10px] text-slate-600 uppercase w-14 text-right">
                        {isDead ? "DEAD" : "ALIVE"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onReturnToLobby}
          className="mx-auto flex items-center gap-2 px-6 py-3 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-full font-mono text-xs text-slate-300 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RETURN TO LOBBY
        </button>
      </div>
    </PhaseLayout>
  );
}
