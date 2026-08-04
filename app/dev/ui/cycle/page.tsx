"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import UptimePhase from "@/components/room/uptime-phase/uptime-phase";
import HangVotePhase from "@/components/room/hearing-phase/hang-vote-phase";
import HangVoteCountPhase from "@/components/room/hearing-phase/hang-vote-count-phase";
import SecurityClearanceResultPhase from "@/components/room/hearing-phase/hang-vote-result-phase";
import KillVotePhase from "@/components/room/kill-vote-phase/kill-vote-phase";
import KillVoteResultPhase from "@/components/room/kill-vote-phase/kill-vote-result-phase";
import DowntimePhase from "@/components/room/downtime-phase/downtime-phase";
import DowntimeBadPhase from "@/components/room/downtime-phase/downtime-bad-phase";
import IncidentReportPhase from "@/components/room/incident-report/incident-report-phase";
import EndScreenPhase from "@/components/room/end-screen/end-screen-phase";
import { InGamePlayer } from "@/lib/definitions";

type PhaseStep = {
  name: string;
  duration: number;
  round: number;
};

const CYCLE_PHASES: PhaseStep[] = [
  { name: "Starting Countdown", duration: 5, round: 1 },
  { name: "Uptime Discussion [L1]", duration: 8, round: 1 },
  { name: "Hearing Vote Active [L1]", duration: 8, round: 1 },
  { name: "Hearing Tabulation [L1]", duration: 3, round: 1 },
  { name: "Hearing Verdict Result [L1]", duration: 5, round: 1 },
  { name: "Downtime (Good Side Q&A) [L1]", duration: 10, round: 1 },
  { name: "Incident Report [L1]", duration: 6, round: 1 },
  { name: "Uptime Discussion [L2]", duration: 8, round: 2 },
  { name: "Hearing Vote Active [L2]", duration: 8, round: 2 },
  { name: "Hearing Tabulation [L2]", duration: 3, round: 2 },
  { name: "Hearing Verdict Result [L2]", duration: 5, round: 2 },
  { name: "Downtime (Bad Side Target Pick) [L2]", duration: 10, round: 2 },
  { name: "Silent Protocol Tabulation [L2]", duration: 3, round: 2 },
  { name: "Silent Protocol Result [L2]", duration: 5, round: 2 },
  { name: "Incident Report [L2]", duration: 6, round: 2 },
  { name: "End Game Screen", duration: 9999, round: 2 },
];

const MOCK_PLAYERS_ROUND_1: InGamePlayer[] = [
  { id: "1", name: "Alice", status: "alive", role: "user", side: "good" },
  { id: "2", name: "Bob", status: "alive", role: "user", side: "good" },
  { id: "3", name: "Charlie", status: "alive", role: "hacker", side: "bad" },
  { id: "4", name: "Dave", status: "dead", role: "user", side: "good" },
];

const MOCK_PLAYERS_ROUND_2: InGamePlayer[] = [
  { id: "1", name: "Alice", status: "dead", role: "user", side: "good" },
  { id: "2", name: "Bob", status: "alive", role: "user", side: "good" },
  { id: "3", name: "Charlie", status: "alive", role: "hacker", side: "bad" },
  { id: "4", name: "Dave", status: "dead", role: "user", side: "good" },
];

export default function DevUiCyclePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState(CYCLE_PHASES[0].duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhase = CYCLE_PHASES[currentStepIndex];

  useEffect(() => {
    setTimeLeft(currentPhase.duration);
  }, [currentStepIndex, currentPhase.duration]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isPlaying && currentPhase.duration < 1000) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCurrentStepIndex((curr) => {
              if (curr >= CYCLE_PHASES.length - 1) {
                setIsPlaying(false);
                return curr;
              }
              return curr + 1;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, currentPhase.duration]);

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStepIndex((prev) => Math.min(CYCLE_PHASES.length - 1, prev + 1));
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setTimeLeft(CYCLE_PHASES[0].duration);
    setIsPlaying(true);
  };

  const activePlayers = currentPhase.round === 1 ? MOCK_PLAYERS_ROUND_1 : MOCK_PLAYERS_ROUND_2;
  const mockTerminatedPlayer = MOCK_PLAYERS_ROUND_1[3];
  const mockKillPlayer = MOCK_PLAYERS_ROUND_1[0];

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-slate-950/85 border border-cyan/20 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">PROTOTYPE LOOP RUNNER</span>
          <span className="text-cyan font-bold tracking-wider truncate max-w-50">
            {currentStepIndex + 1}/{CYCLE_PHASES.length}: {currentPhase.name}
          </span>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan/40 text-slate-300 disabled:opacity-30 disabled:hover:border-slate-800 transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-cyan/10 border border-cyan/30 hover:bg-cyan/20 text-cyan transition-colors"
            title={isPlaying ? "Pause Cycle" : "Play Cycle"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === CYCLE_PHASES.length - 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan/40 text-slate-300 disabled:opacity-30 disabled:hover:border-slate-800 transition-colors"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition-colors"
            title="Reset Cycle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
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

      {currentStepIndex === 0 && (
        <div className="w-full h-full flex flex-col justify-center items-center bg-[#020617] text-cyan font-mono relative">
          <span className="w-2.5 h-2.5 bg-cyan rounded-full mb-3" />
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase mb-4">
            INITIALIZING PROTOCOL
          </h2>
          <div className="text-xs text-slate-500 uppercase tracking-widest">
            Auto-advancing in {timeLeft}s
          </div>
        </div>
      )}

      {(currentStepIndex === 1 || currentStepIndex === 7) && (
        <UptimePhase
          round={currentPhase.round}
          timeLeft={timeLeft}
          totalDuration={currentPhase.duration}
          players={activePlayers}
        />
      )}

      {(currentStepIndex === 2 || currentStepIndex === 8) && (
        <HangVotePhase
          players={activePlayers}
          timeLeft={timeLeft}
          round={currentPhase.round}
          voteValue="none"
          onVote={() => {}}
          isUserAlive={currentPhase.round === 1 || activePlayers[0].status === "alive"}
        />
      )}

      {(currentStepIndex === 3 || currentStepIndex === 9) && (
        <HangVoteCountPhase round={currentPhase.round} />
      )}

      {(currentStepIndex === 4 || currentStepIndex === 10) && (
        <SecurityClearanceResultPhase
          round={currentPhase.round}
          lastDeadPlayer={currentStepIndex === 4 ? mockTerminatedPlayer : null}
          timeLeft={timeLeft}
        />
      )}

      {currentStepIndex === 5 && (
        <DowntimePhase
          roomCode="DEV-ROOM"
          round={currentPhase.round}
          timeLeft={timeLeft}
          totalDuration={currentPhase.duration}
          phaseDuration={60}
        />
      )}

      {currentStepIndex === 11 && (
        <KillVotePhase
          players={activePlayers}
          timeLeft={timeLeft}
          round={currentPhase.round}
          voteValue="none"
          onVote={() => {}}
          isUserBadSide={true}
          isUserAlive={true}
        />
      )}

      {currentStepIndex === 12 && (
        <HangVoteCountPhase round={currentPhase.round} />
      )}

      {currentStepIndex === 13 && (
        <KillVoteResultPhase
          round={currentPhase.round}
          lastDeadPlayer={mockKillPlayer}
          voterByCandidate={{ "1": ["Charlie"] }}
          timeLeft={timeLeft}
          players={activePlayers}
          isUserBadSide={true}
          isUserAlive={true}
        />
      )}

      {(currentStepIndex === 6 || currentStepIndex === 14) && (
        <IncidentReportPhase
          round={currentPhase.round}
          killDeadPlayer={mockKillPlayer}
          timeLeft={timeLeft}
        />
      )}

      {currentStepIndex === 15 && (
        <EndScreenPhase
          endGame="goodEnd"
          round={currentPhase.round}
          players={activePlayers}
          onReturnToLobby={handleReset}
        />
      )}
    </div>
  );
}
