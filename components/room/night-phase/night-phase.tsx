"use client";

import React, { useState, useEffect, useCallback } from "react";
import { NIGHT_QUESTIONS, Question } from "./questions";
import {
  NightHeader,
  NightTimer,
  NightProgressBar,
  NightQuestionCard,
  NightOptionsList,
  NightSubmitButton,
} from "./components";

interface NightPhaseProps {
  roomCode: string;
  round: number;
  timeLeft: number;
  totalDuration: number;
}

/**
 * Generates a deterministic index based on room code and round number.
 * This ensures all players in the same room and round get the same question.
 */
function getDeterministicQuestion(roomCode: string, round: number): Question {
  const seed = `${roomCode}-${round}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % NIGHT_QUESTIONS.length;
  return NIGHT_QUESTIONS[index];
}

export default function NightPhase({
  roomCode,
  round,
  timeLeft,
  totalDuration,
}: NightPhaseProps) {
  const currentQuestion = getDeterministicQuestion(roomCode, round);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      setIsSubmitted(true);
    }
  }, [timeLeft, isSubmitted]);

  // Reset local state if the round changes
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [round]);

  const handleSelect = useCallback(
    (optionId: "A" | "B" | "C" | "D") => {
      if (isSubmitted) return;
      setSelectedOption(optionId);
    },
    [isSubmitted]
  );

  const handleSubmit = useCallback(() => {
    if (!selectedOption) return;
    setIsSubmitted(true);
  }, [selectedOption]);

  const handleReset = useCallback(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
  }, []);

  const progressPercentage = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;

  return (
    <div className="w-full max-w-[390px] h-[780px] bg-[#020617] border border-rose-950/40 rounded-[32px] shadow-[0_0_80px_rgba(255,42,85,0.08)] relative overflow-hidden flex flex-col justify-between p-6 pt-[87px] pb-6">
      
      {/* Global CSS animation for the scanline sweep indicator */}
      <style jsx global>{`
        @keyframes scanline-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-scanline {
          animation: scanline-sweep 2.5s infinite linear;
        }
      `}</style>

      {/* Terminal Header */}
      <NightHeader onReset={handleReset} />

      {/* Content Body */}
      <main className="flex-1 flex flex-col justify-center gap-6 z-10 my-auto">
        {/* Timer status */}
        <NightTimer timeLeft={timeLeft} />

        {/* Time Remaining Bar */}
        <NightProgressBar
          progressPercentage={progressPercentage}
          timeLeft={timeLeft}
          isSubmitted={isSubmitted}
        />

        {/* Sci-Fi styled Question Card */}
        <NightQuestionCard question={currentQuestion.text} />

        {/* Quiz Option buttons list */}
        <NightOptionsList
          options={currentQuestion.options}
          selectedOption={selectedOption}
          isSubmitted={isSubmitted}
          correctAnswer={currentQuestion.correctAnswer}
          onSelect={handleSelect}
        />
      </main>

      {/* Action Submit Button */}
      <NightSubmitButton
        isSubmitted={isSubmitted}
        hasSelection={!!selectedOption}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
