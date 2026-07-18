"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DOWNTIME_QUESTIONS, Question } from "./questions";
import {
  DowntimeHeader,
  DowntimeTimer,
  DowntimeProgressBar,
  DowntimeQuestionCard,
  DowntimeOptionsList,
  DowntimeTimerCompact,
} from "./components";
import PhaseLayout from "@/components/phase-layout";

interface DowntimePhaseProps {
  roomCode: string;
  round: number;
  timeLeft: number;
  totalDuration: number;
  phaseDuration?: number;
}

function getDeterministicQuestion(roomCode: string, round: number): Question {
  const seed = `${roomCode}-${round}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DOWNTIME_QUESTIONS.length;
  return DOWNTIME_QUESTIONS[index];
}

export default function DowntimePhase({
  roomCode,
  round,
  timeLeft,
  totalDuration,
  phaseDuration = 60,
}: DowntimePhaseProps) {
  const currentQuestion = getDeterministicQuestion(roomCode, round);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(phaseDuration);

  useEffect(() => {
    setPhaseTimeLeft(phaseDuration);
    const interval = setInterval(() => {
      setPhaseTimeLeft((prev) => (prev <= 1 ? phaseDuration : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseDuration]);

  useEffect(() => {
    setSelectedOption(null);
  }, [round]);

  const handleSelect = useCallback(
    (optionId: "A" | "B" | "C" | "D") => {
      setSelectedOption(optionId);
    },
    []
  );

  const handleReset = useCallback(() => {
    setSelectedOption(null);
  }, []);

  const progressPercentage = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;

  return (
    <PhaseLayout theme="downtime">
      <style>{`
        @keyframes scanline-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scanline {
          animation: scanline-sweep 2.5s infinite linear;
        }
      `}</style>

      <DowntimeHeader onReset={handleReset} />

      <div className="md:hidden flex flex-col justify-between h-full w-full max-w-[420px] mx-auto pt-[70px] pb-4 gap-4 overflow-y-auto">
        <main className="flex-1 flex flex-col justify-center gap-5 z-10 my-auto">
          <DowntimeTimer phaseTimeLeft={phaseTimeLeft} />
          <DowntimeTimerCompact timeLeft={timeLeft} />
          <DowntimeProgressBar
            progressPercentage={progressPercentage}
            timeLeft={timeLeft}
          />
          <DowntimeQuestionCard question={currentQuestion.text} />
          <DowntimeOptionsList
            options={currentQuestion.options}
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        </main>
      </div>

      <div className="hidden md:flex flex-col flex-1 w-full max-w-6xl mx-auto pt-[70px] pb-4 justify-between">
        <div className="flex gap-10 items-center justify-center flex-1 my-auto">
          <div className="flex flex-col gap-6 flex-1 max-w-xl">
            <DowntimeTimer phaseTimeLeft={phaseTimeLeft} />
            <DowntimeProgressBar
              progressPercentage={progressPercentage}
              timeLeft={timeLeft}
            />
            <DowntimeQuestionCard question={currentQuestion.text} />
          </div>

          <div className="flex flex-col justify-center gap-6 w-[440px] shrink-0 bg-slate-950/40 border border-rose-500/10 p-6 rounded-3xl backdrop-blur-md min-h-[400px]">
            <DowntimeTimerCompact timeLeft={timeLeft} />

            <div className="flex-1 flex flex-col justify-center">
              <DowntimeOptionsList
                options={currentQuestion.options}
                selectedOption={selectedOption}
                onSelect={handleSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </PhaseLayout>
  );
}
