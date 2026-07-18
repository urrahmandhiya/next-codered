"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DowntimePhase from "@/components/room/downtime-phase/downtime-phase";

const TOTAL_DURATION = 15;

export default function DevDowntimePhaseUiPage() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [round, setRound] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Reset timer when it reaches 0 and increment round for infinite loop preview
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
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-rose-500/30 hover:border-rose-500/60 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-500" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      <DowntimePhase
        roomCode="DEV-ROOM"
        round={round}
        timeLeft={timeLeft}
        totalDuration={TOTAL_DURATION}
        phaseDuration={60}
      />
    </div>
  );
}
