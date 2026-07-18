"use client";

import React, { useState, useEffect } from "react";
import PhaseLayout from "@/components/phase-layout";
import { DowntimeHeader } from "./components";

interface DowntimeBadPhaseProps {
  phaseDuration?: number;
}

export default function DowntimeBadPhase({
  phaseDuration = 60,
}: DowntimeBadPhaseProps) {
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(phaseDuration);

  useEffect(() => {
    setPhaseTimeLeft(phaseDuration);
    const interval = setInterval(() => {
      setPhaseTimeLeft((prev) => (prev <= 1 ? phaseDuration : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseDuration]);

  const minutes = Math.floor(phaseTimeLeft / 60).toString().padStart(2, "0");
  const seconds = (phaseTimeLeft % 60).toString().padStart(2, "0");

  return (
    <PhaseLayout theme="downtime">
      <DowntimeHeader />

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto text-center p-8 bg-slate-950/60 border border-[#FF2A55]/30 rounded-3xl backdrop-blur-md shadow-[0_0_80px_rgba(255,42,85,0.12)] my-auto font-mono">
        <span className="text-xs text-rose-400 tracking-[0.2em] uppercase mb-2">
          SYSTEM MAINTENANCE // DOWNTIME PROTOCOL
        </span>
        <h2 className="text-3xl font-extrabold text-[#FF2A55] tracking-widest uppercase mb-3 drop-shadow-[0_0_12px_rgba(255,42,85,0.4)]">
          ESTABLISHING UPLINK
        </h2>
        <p className="text-xs text-rose-300/70 leading-relaxed max-w-sm mx-auto mb-6">
          Maintaining radio silence. Waiting for coordinates of the decryption targets.
        </p>

        <div className="flex flex-col items-center gap-1 bg-slate-900/60 border border-rose-500/20 px-6 py-3 rounded-2xl">
          <span className="text-[10px] text-rose-400 uppercase tracking-widest">
            MAINTENANCE_END_IN
          </span>
          <span className="text-3xl font-bold text-[#FF2A55] tracking-widest drop-shadow-[0_0_8px_rgba(255,42,85,0.4)]">
            {minutes}:{seconds}
          </span>
        </div>
      </div>
    </PhaseLayout>
  );
}
