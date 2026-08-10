"use client";

import PhaseLayout from "@/components/phase-layout";
import { RotateCcw } from "lucide-react";

export default function RoomAborted({ action }: { action: () => void }) {

  return (
    <PhaseLayout>
      <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto pt-15 pb-6 justify-between h-full">
        <div className="flex-1 flex flex-col justify-center items-center gap-6 my-auto">
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-xs tracking-[0.25em] text-slate-400 uppercase">
              ROOM ABORTED
            </span>
            <p className="font-mono text-[11px] text-slate-500 tracking-wider mt-2">
              CREATE OR JOIN ANOTHER NON-EXPIRED ROOM
            </p>
          </div>
        </div>

        <button
          onClick={action}
          className="mx-auto flex items-center gap-2 px-6 py-3 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-full font-mono text-xs text-slate-300 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RETURN TO LOBBY
        </button>
      </div>
    </PhaseLayout>
  );
}
