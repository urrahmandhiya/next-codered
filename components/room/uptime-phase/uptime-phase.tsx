"use client";

import React from "react";
import PhaseLayout from "@/components/phase-layout";
import { InGamePlayer } from "@/lib/definitions";
import { cn } from "@/lib/utils";

interface UptimePhaseProps {
  timeLeft: number;
  totalDuration: number;
  round: number;
  players: InGamePlayer[];
}

export default function UptimePhase({
  timeLeft,
  totalDuration,
  round,
  players,
}: UptimePhaseProps) {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const progressPercentage = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
  const isUrgent = timeLeft <= 15;

  const alivePlayers = players.filter((p) => p.status === "alive");

  return (
    <PhaseLayout theme="uptime">
      <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-cyan/20 backdrop-blur-md z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-cyan rounded-full" />
          <span className="font-mono text-xs tracking-[0.2em] text-cyan uppercase opacity-90">
            SYSTEM ONLINE
          </span>
        </div>
        <span className="font-mono text-xs tracking-widest text-slate-400 uppercase">
          ROUND_{String(round).padStart(2, "0")}
        </span>
      </header>

      <div className="md:hidden flex flex-col h-full w-full max-w-[420px] mx-auto pt-[70px] pb-4 gap-4">
        <div className="flex flex-col items-center pt-6 gap-2">
          <span className="font-mono text-[11px] tracking-[0.2em] text-cyan/70 uppercase">
            DISCUSSION_WINDOW
          </span>
          <span className={cn(
            "font-mono font-bold text-[52px] leading-none tracking-[2px]",
            isUrgent
              ? "text-rose-400 drop-shadow-[0_0_12px_rgba(255,42,85,0.5)]"
              : "text-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          )}>
            {minutes}:{seconds}
          </span>
        </div>

        <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isUrgent ? "bg-rose-500" : "bg-cyan"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase px-1">
            ACTIVE_NODES // {alivePlayers.length} ONLINE
          </span>
          {players.map((player) => {
            const isDead = player.status !== "alive";
            return (
              <div
                key={player.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border font-mono text-sm",
                  isDead
                    ? "border-slate-800 bg-slate-950/40 opacity-50"
                    : "border-cyan/20 bg-slate-950/60 backdrop-blur-sm"
                )}
              >
                <span className={cn("text-sm", isDead ? "text-slate-600 line-through" : "text-slate-200")}>
                  {player.name}
                </span>
                <span className={cn(
                  "text-[10px] tracking-widest uppercase font-semibold",
                  isDead ? "text-slate-600" : "text-cyan"
                )}>
                  {isDead ? "TERMINATED" : "ONLINE"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden md:flex flex-col flex-1 w-full max-w-6xl mx-auto pt-[80px] pb-8">
        <div className="flex gap-10 items-center justify-center flex-1 my-auto">
          <div className="flex flex-col items-center gap-8 flex-1">
            <div className="flex flex-col items-center gap-3">
              <span className="font-mono text-xs tracking-[0.3em] text-cyan/70 uppercase">
                DISCUSSION_WINDOW
              </span>
              <span className={cn(
                "font-mono font-bold text-[80px] leading-none tracking-[4px]",
                isUrgent
                  ? "text-rose-400 drop-shadow-[0_0_20px_rgba(255,42,85,0.5)]"
                  : "text-cyan drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              )}>
                {minutes}:{seconds}
              </span>
            </div>

            <div className="w-full max-w-sm h-0.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isUrgent ? "bg-rose-500" : "bg-cyan"
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="font-mono text-xs text-slate-500 tracking-widest uppercase">
                IDENTIFY ANOMALOUS NODES
              </p>
              <p className="font-mono text-xs text-slate-600">
                Discuss, deduce, vote — before downtime begins.
              </p>
            </div>
          </div>

          <div className="w-[380px] shrink-0 bg-slate-950/60 border border-cyan/15 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-cyan/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan rounded-full" />
                <h3 className="font-mono text-xs tracking-[0.2em] text-cyan uppercase font-semibold">
                  NODE_ROSTER
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase">
                {alivePlayers.length}/{players.length} ONLINE
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
              {players.map((player) => {
                const isDead = player.status !== "alive";
                return (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl border",
                      isDead
                        ? "border-slate-800/60 bg-slate-950/20 opacity-40"
                        : "border-cyan/20 bg-slate-900/40"
                    )}
                  >
                    <span className={cn(
                      "font-mono text-sm",
                      isDead ? "text-slate-600 line-through" : "text-slate-200"
                    )}>
                      {player.name}
                    </span>
                    <span className={cn(
                      "font-mono text-[10px] tracking-widest uppercase font-semibold",
                      isDead ? "text-slate-600" : "text-cyan"
                    )}>
                      {isDead ? "TERMINATED" : "ONLINE"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PhaseLayout>
  );
}
