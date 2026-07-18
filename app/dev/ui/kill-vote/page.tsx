"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, UserCheck } from "lucide-react";
import KillVotePhase from "@/components/room/kill-vote-phase/kill-vote-phase";
import KillVoteResultPhase from "@/components/room/kill-vote-phase/kill-vote-result-phase";
import { InGamePlayer } from "@/lib/definitions";

type PreviewSubPhase = "vote" | "result";

const MOCK_PLAYERS: InGamePlayer[] = [
  { id: "1", name: "Alice", status: "alive", role: "villager", side: "good" },
  { id: "2", name: "Bob", status: "alive", role: "villager", side: "good" },
  { id: "3", name: "Charlie", status: "alive", role: "werewolf", side: "bad" },
  { id: "4", name: "Dave", status: "dead", role: "villager", side: "good" },
];

export default function DevKillVoteUiPage() {
  const [subPhase, setSubPhase] = useState<PreviewSubPhase>("vote");
  const [isWerewolfPOV, setIsWerewolfPOV] = useState<boolean>(true);
  const [voteValue, setVoteValue] = useState<string>("none");
  const [timeLeft, setTimeLeft] = useState<number>(15);

  useEffect(() => {
    setTimeLeft(subPhase === "vote" ? 15 : 5);
  }, [subPhase]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSubPhase((curr) => (curr === "vote" ? "result" : "vote"));
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [subPhase]);

  const handleVote = (val: string) => {
    setVoteValue(val);
  };

  const currentTerminatedPlayer: InGamePlayer = {
    id: "1",
    name: "Alice",
    status: "dead",
    role: "villager",
    side: "good",
  };

  const mockVoterBreakdown = {
    "1": ["3"],
  };

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      {/* Dev panel overlay */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-slate-950/85 border border-rose-500/20 p-2.5 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="flex flex-col gap-0.5 text-right font-mono text-[10px]">
          <span className="text-rose-500 uppercase tracking-wider">
            SUB_PHASE: {subPhase}
          </span>
          <span className="text-slate-400">
            POV: {isWerewolfPOV ? "WEREWOLF" : "VILLAGER"}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSubPhase((curr) => (curr === "vote" ? "result" : "vote"))}
            className="p-1 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"
            title="Switch Sub Phase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsWerewolfPOV((prev) => !prev)}
            className="p-1 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"
            title="Switch POV"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dev"
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-rose-500/30 hover:border-rose-500/60 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-500" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      {subPhase === "vote" ? (
        <KillVotePhase
          players={MOCK_PLAYERS}
          timeLeft={timeLeft}
          round={1}
          voteValue={voteValue}
          onVote={handleVote}
          isUserBadSide={isWerewolfPOV}
          isUserAlive={true}
        />
      ) : (
        <KillVoteResultPhase
          round={1}
          lastDeadPlayer={currentTerminatedPlayer}
          voterByCandidate={mockVoterBreakdown}
          timeLeft={timeLeft}
          players={MOCK_PLAYERS}
          isUserBadSide={isWerewolfPOV}
          isUserAlive={true}
        />
      )}
    </div>
  );
}
