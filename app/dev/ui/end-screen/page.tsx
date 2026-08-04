"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import EndScreenPhase from "@/components/room/end-screen/end-screen-phase";
import { InGamePlayer } from "@/lib/definitions";

const MOCK_PLAYERS: InGamePlayer[] = [
  { id: "1", name: "Alice", status: "dead", role: "user", side: "good" },
  { id: "2", name: "Bob", status: "alive", role: "user", side: "good" },
  { id: "3", name: "Charlie", status: "alive", role: "hacker", side: "bad" },
  { id: "4", name: "Dave", status: "dead", role: "hacker", side: "bad" },
];

export default function DevEndScreenUiPage() {
  const [endGame, setEndGame] = useState<"goodEnd" | "badEnd">("goodEnd");

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      {/* Dev panel overlay */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-950/85 border border-slate-800 p-2.5 rounded-2xl backdrop-blur-md shadow-xl">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
          VICTORY: {endGame === "goodEnd" ? "GOOD" : "BAD"}
        </span>
        <button
          onClick={() => setEndGame((curr) => (curr === "goodEnd" ? "badEnd" : "goodEnd"))}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
          title="Toggle Victory Side"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dev"
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      <EndScreenPhase
        endGame={endGame}
        round={4}
        players={MOCK_PLAYERS}
        onReturnToLobby={() => alert("Return to Lobby clicked!")}
      />
    </div>
  );
}
