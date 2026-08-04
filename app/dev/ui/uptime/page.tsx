"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UptimePhase from "@/components/room/uptime-phase/uptime-phase";
import { InGamePlayer } from "@/lib/definitions";

const TOTAL_DURATION = 30;

const MOCK_PLAYERS: InGamePlayer[] = [
  { id: "1", name: "Alice", status: "alive", role: "user", side: "good" },
  { id: "2", name: "Bob", status: "alive", role: "user", side: "good" },
  { id: "3", name: "Charlie", status: "alive", role: "hacker", side: "bad" },
  { id: "4", name: "Dave", status: "dead", role: "user", side: "good" },
  { id: "5", name: "Eve", status: "dead", role: "hacker", side: "bad" },
];

export default function DevUptimePhaseUiPage() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [round, setRound] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRound((r) => r + 1);
          return TOTAL_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      {/* Floating Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dev"
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-cyan/30 hover:border-cyan/60 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      <UptimePhase
        round={round}
        timeLeft={timeLeft}
        totalDuration={TOTAL_DURATION}
        players={MOCK_PLAYERS}
      />
    </div>
  );
}
