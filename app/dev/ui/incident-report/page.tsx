"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import IncidentReportPhase from "@/components/room/incident-report/incident-report-phase";
import { InGamePlayer } from "@/lib/definitions";

export default function DevIncidentReportUiPage() {
  const [timeLeft, setTimeLeft] = useState(10);
  const [round, setRound] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRound((r) => r + 1);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const killDeadPlayer: InGamePlayer = {
    id: "1",
    name: "Alice",
    status: "dead",
    role: "villager",
    side: "good",
  };

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dev"
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-cyan/30 hover:border-cyan/60 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      <IncidentReportPhase
        round={round}
        killDeadPlayer={killDeadPlayer}
        timeLeft={timeLeft}
      />
    </div>
  );
}
