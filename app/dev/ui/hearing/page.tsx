"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import HangVotePhase from "@/components/room/hearing-phase/hang-vote-phase";
import HangVoteCountPhase from "@/components/room/hearing-phase/hang-vote-count-phase";
import SecurityClearanceResultPhase from "@/components/room/hearing-phase/hang-vote-result-phase";
import { InGamePlayer } from "@/lib/definitions";

type PreviewSubPhase = "vote" | "count" | "result_terminated" | "result_consensus";

const MOCK_PLAYERS: InGamePlayer[] = [
  { id: "1", name: "Alice", status: "alive", role: "user", side: "good" },
  { id: "2", name: "Bob", status: "alive", role: "user", side: "good" },
  { id: "3", name: "Charlie", status: "alive", role: "hacker", side: "bad" },
  { id: "4", name: "Dave", status: "dead", role: "user", side: "good" },
];

export default function DevHearingUiPage() {
  const [subPhase, setSubPhase] = useState<PreviewSubPhase>("vote");
  const [voteValue, setVoteValue] = useState<string>("none");
  const [timeLeft, setTimeLeft] = useState<number>(30);

  useEffect(() => {
    setTimeLeft(subPhase === "vote" ? 30 : 5);
  }, [subPhase]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSubPhase((curr) => {
            if (curr === "vote") return "count";
            if (curr === "count") return "result_terminated";
            if (curr === "result_terminated") return "result_consensus";
            return "vote";
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVote = (val: string) => {
    setVoteValue(val);
  };

  const currentTerminatedPlayer: InGamePlayer = {
    id: "3",
    name: "Charlie",
    status: "dead",
    role: "hacker",
    side: "bad",
  };

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-950/85 border border-cyan/20 p-2.5 rounded-2xl backdrop-blur-md shadow-xl">
        <span className="font-mono text-[10px] text-cyan uppercase tracking-wider">
          SUB_PHASE: {subPhase}
        </span>
        <button
          onClick={() => {
            setSubPhase((curr) => {
              if (curr === "vote") return "count";
              if (curr === "count") return "result_terminated";
              if (curr === "result_terminated") return "result_consensus";
              return "vote";
            });
          }}
          className="p-1 hover:bg-cyan/10 rounded-lg text-cyan transition-colors"
          title="Switch Sub Phase"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dev"
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-cyan/30 hover:border-cyan/60 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      {subPhase === "vote" && (
        <HangVotePhase
          players={MOCK_PLAYERS}
          timeLeft={timeLeft}
          round={1}
          voteValue={voteValue}
          onVote={handleVote}
          isUserAlive={true}
        />
      )}

      {subPhase === "count" && (
        <HangVoteCountPhase round={1} />
      )}

      {subPhase === "result_terminated" && (
        <SecurityClearanceResultPhase
          round={1}
          lastDeadPlayer={currentTerminatedPlayer}
          timeLeft={timeLeft}
        />
      )}

      {subPhase === "result_consensus" && (
        <SecurityClearanceResultPhase
          round={1}
          lastDeadPlayer={null}
          timeLeft={timeLeft}
        />
      )}
    </div>
  );
}
