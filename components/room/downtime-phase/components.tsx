"use client";

import React from "react";
import { Option } from "./questions";
import { cn } from "@/lib/utils";

interface DowntimeHeaderProps {
  onReset?: () => void;
}

export const DowntimeHeader: React.FC<DowntimeHeaderProps> = ({ onReset }) => {
  return (
    <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-rose-500/20 backdrop-blur-md z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-[#FF2A55] rounded-full" />
        <span className="font-mono text-xs tracking-[0.2em] text-rose-500 uppercase opacity-90">
          DOWNTIME PROTOCOL
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 font-mono text-[10px] text-rose-400 tracking-wider transition-colors"
          >
            DESELECT
          </button>
        )}
        <span className="font-mono text-xs tracking-widest text-slate-400 uppercase">
          LIVE_SIGNAL
        </span>
      </div>
    </header>
  );
};

interface DowntimeTimerProps {
  phaseTimeLeft: number;
}

export const DowntimeTimer: React.FC<DowntimeTimerProps> = ({ phaseTimeLeft }) => {
  const minutes = Math.floor(phaseTimeLeft / 60).toString().padStart(2, "0");
  const seconds = (phaseTimeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center">
        <span className="font-mono text-[12px] leading-[16px] tracking-[1.2px] uppercase text-[#FF2A55]">
          SYSTEM MAINTENANCE
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-mono font-bold text-[48px] leading-[48px] tracking-[2.4px] text-[#FF2A55] drop-shadow-[0_0_8px_rgba(255,42,85,0.4)]">
          {minutes}:{seconds}
        </span>
      </div>
    </div>
  );
};

interface DowntimeTimerCompactProps {
  timeLeft: number;
}

export const DowntimeTimerCompact: React.FC<DowntimeTimerCompactProps> = ({ timeLeft }) => {
  const formattedTime = timeLeft.toString().padStart(2, "0");
  const isUrgent = timeLeft <= 5;

  return (
    <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-rose-500/20 rounded-xl px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full", isUrgent ? "bg-rose-500" : "bg-rose-500/60")} />
        <span className="font-mono text-[11px] tracking-[1.2px] uppercase text-rose-400">
          QUEST_TIMEOUT
        </span>
      </div>
      <span className={cn(
        "font-mono font-bold text-[22px] leading-none tracking-[2px]",
        isUrgent
          ? "text-rose-400 drop-shadow-[0_0_8px_rgba(255,42,85,0.6)]"
          : "text-[#FF2A55] drop-shadow-[0_0_4px_rgba(255,42,85,0.3)]"
      )}>
        00:{formattedTime}
      </span>
    </div>
  );
};

interface DowntimeProgressBarProps {
  progressPercentage: number;
  timeLeft: number;
}

export const DowntimeProgressBar: React.FC<DowntimeProgressBarProps> = ({
  progressPercentage,
  timeLeft,
}) => {
  const isUrgent = timeLeft <= 5;

  return (
    <div className="w-full bg-slate-900/60 border border-rose-500/20 rounded-xl p-3 backdrop-blur-md flex flex-col gap-2">
      <div className="flex justify-between items-center font-mono text-[11px] text-slate-400">
        <span className="tracking-widest uppercase">QUEST_WINDOW</span>
        <span className={cn("font-bold tracking-wider", isUrgent ? "text-rose-400" : "text-rose-300")}>
          00:{timeLeft.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-rose-500/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isUrgent
              ? "bg-[#FF2A55] shadow-[0_0_12px_rgba(255,42,85,0.8)]"
              : "bg-gradient-to-r from-rose-700 to-[#FF2A55]"
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

interface DowntimeQuestionCardProps {
  question: string;
}

export const DowntimeQuestionCard: React.FC<DowntimeQuestionCardProps> = ({ question }) => {
  return (
    <div className="relative overflow-hidden bg-slate-950/40 border border-rose-500/20 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-3 shadow-[0_0_30px_rgba(255,42,85,0.05)]">
      <div className="flex items-center gap-2 border-b border-rose-500/10 pb-2">
        <span className="font-mono text-[10px] tracking-[1.5px] uppercase text-rose-400/80">
          SIGNAL_ANALYSIS // ENCRYPTED_STREAM
        </span>
      </div>

      <p className="font-mono text-sm md:text-base text-slate-200 leading-relaxed font-medium">
        {question}
      </p>
    </div>
  );
};

interface DowntimeOptionsListProps {
  options: Option[];
  selectedOption: "A" | "B" | "C" | "D" | null;
  onSelect: (optionId: "A" | "B" | "C" | "D") => void;
}

export const DowntimeOptionsList: React.FC<DowntimeOptionsListProps> = ({
  options,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = selectedOption === option.id;

        return (
          <button
            key={option.id}
            onClick={() => onSelect(isSelected ? (null as any) : option.id)}
            className={cn(
              "group relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl border font-mono text-sm text-left transition-all duration-200",
              isSelected
                ? "border-[#FF2A55] bg-rose-950/40 text-white shadow-[0_0_15px_rgba(255,42,85,0.25)]"
                : "border-rose-500/20 bg-slate-950/60 text-slate-300 hover:border-rose-500/40 hover:bg-slate-900/60"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                  isSelected
                    ? "bg-[#FF2A55] text-white"
                    : "bg-slate-900 border border-rose-500/20 text-rose-400 group-hover:border-rose-500/40"
                )}
              >
                {option.id}
              </span>
              <span className="truncate">{option.text}</span>
            </div>

            {isSelected && (
              <span className="text-[10px] tracking-widest text-[#FF2A55] uppercase font-bold shrink-0">
                SELECTED
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
