import React from "react";
import { Shield, RotateCcw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizOption } from "./questions";

// --- HEADER COMPONENT ---
interface NightHeaderProps {
  onReset: () => void;
}

export const NightHeader: React.FC<NightHeaderProps> = ({ onReset }) => {
  return (
    <header className="absolute w-full h-[63px] left-0 top-0 bg-slate-950/60 border-b border-rose-500/20 backdrop-blur-md rounded-b-lg z-50 flex flex-col justify-between">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="font-sans font-bold text-[20px] leading-[28px] tracking-[2px] uppercase text-[#FF2A55] drop-shadow-[0_0_10px_rgba(255,42,85,0.5)] flex items-center gap-1.5">
          <Shield className="h-5 w-5 text-[#FF2A55] animate-pulse" />
          CODE RED
        </h1>
        <button
          onClick={onReset}
          className="font-mono font-medium text-[14px] leading-[20px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          RESET
        </button>
      </div>
      <div className="w-full h-[1px] bg-gradient-to-r from-rose-500/0 via-rose-500/50 to-rose-500/0" />
    </header>
  );
};

// --- TIMER COMPONENT ---
interface NightTimerProps {
  timeLeft: number;
}

export const NightTimer: React.FC<NightTimerProps> = ({ timeLeft }) => {
  const formattedTime = timeLeft.toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center">
        <span className="font-mono text-[12px] leading-[16px] tracking-[1.2px] uppercase text-[#FF2A55] animate-pulse">
          SIDE QUEST: SECURE SIGNAL
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-mono font-bold text-[48px] leading-[48px] tracking-[2.4px] text-[#FF2A55] drop-shadow-[0_0_8px_rgba(255,42,85,0.4)]">
          00:{formattedTime}
        </span>
      </div>
    </div>
  );
};

// --- PROGRESS BAR COMPONENT ---
interface NightProgressBarProps {
  progressPercentage: number;
  timeLeft: number;
  isSubmitted: boolean;
}

export const NightProgressBar: React.FC<NightProgressBarProps> = ({
  progressPercentage,
  timeLeft,
  isSubmitted,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[12px] leading-[16px] tracking-[0.6px] text-rose-400">
          {isSubmitted ? "SYS_STATUS_LOCKED" : "DECRYPTION_TIMEOUT"}
        </span>
        <span className="font-mono font-bold text-[12px] leading-[16px] tracking-[0.6px] text-rose-500">
          {timeLeft}s
        </span>
      </div>
      <div className="h-3 w-full bg-slate-900 border border-red-950/30 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex items-center p-[1px] overflow-hidden">
        <div
          className="h-[10px] bg-red-600 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] relative transition-all duration-1000 ease-linear overflow-hidden"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50 animate-scanline w-[200px]" />
        </div>
      </div>
    </div>
  );
};

// --- QUESTION CARD COMPONENT ---
interface NightQuestionCardProps {
  question: string;
}

export const NightQuestionCard: React.FC<NightQuestionCardProps> = ({ question }) => {
  return (
    <div className="bg-slate-900/60 border border-rose-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md rounded-xl p-6 relative gap-[11px] flex flex-col">
      {/* Sci-fi Corner Borders */}
      <div className="absolute w-2 h-2 left-[1px] top-[1px] border-t border-l border-rose-500/50 rounded-tl-[4px]" />
      <div className="absolute w-2 h-2 right-[1px] top-[1px] border-t border-r border-rose-500/50 rounded-tr-[4px]" />
      <div className="absolute w-2 h-2 left-[1px] bottom-[1px] border-b border-l border-rose-500/50 rounded-bl-[4px]" />
      <div className="absolute w-2 h-2 right-[1px] bottom-[1px] border-b border-r border-rose-500/50 rounded-br-[4px]" />

      <div className="flex items-center gap-2 opacity-80">
        <span className="w-2 h-2 bg-rose-500 rounded-full" />
        <span className="font-mono text-[12px] leading-[16px] tracking-[1.2px] text-rose-500">
          DECRYPTION_QUEST
        </span>
      </div>

      <h3 className="font-sans font-semibold text-[18px] leading-[25px] text-slate-100">
        {question}
      </h3>
    </div>
  );
};

// --- OPTIONS LIST COMPONENT ---
interface NightOptionsListProps {
  options: QuizOption[];
  selectedOption: string | null;
  isSubmitted: boolean;
  correctAnswer: string;
  onSelect: (optionId: "A" | "B" | "C" | "D") => void;
}

export const NightOptionsList: React.FC<NightOptionsListProps> = ({
  options,
  selectedOption,
  isSubmitted,
  correctAnswer,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = selectedOption === option.id;
        const isCorrectOption = option.id === correctAnswer;

        let buttonBg = "bg-slate-900/60";
        let buttonBorder = "border-white/10";
        let letterBg = "bg-slate-950";
        let letterText = "text-rose-500";
        let letterBorder = "border-white/10";
        let optionTextClass = "text-slate-300";

        if (isSelected) {
          if (isSubmitted) {
            buttonBg = isCorrectOption ? "bg-emerald-600" : "bg-[#FF2A55]";
            buttonBorder = isCorrectOption
              ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "border-[#FF2A55] shadow-[0_0_15px_rgba(255,42,85,0.4)]";
            letterBg = "bg-white";
            letterText = isCorrectOption ? "text-emerald-600" : "text-[#FF2A55]";
            letterBorder = "border-white";
            optionTextClass = "text-white font-bold";
          } else {
            buttonBg = "bg-[#FF2A55]";
            buttonBorder = "border-[#FF2A55] shadow-[0_0_15px_rgba(255,42,85,0.4)]";
            letterBg = "bg-white";
            letterText = "text-[#FF2A55]";
            letterBorder = "border-white";
            optionTextClass = "text-white font-bold";
          }
        } else if (isSubmitted && isCorrectOption) {
          buttonBorder = "border-emerald-500/50";
          letterText = "text-emerald-500";
          letterBorder = "border-emerald-500/20";
        }

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={isSubmitted}
            className={cn(
              "w-full h-[58px] border rounded-full flex items-center p-2 relative overflow-hidden transition-all duration-300 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]",
              buttonBg,
              buttonBorder,
              !isSubmitted && "cursor-pointer hover:border-white/30"
            )}
          >
            <div className="absolute inset-0 bg-white/[0.03] opacity-0 hover:opacity-100 transition-opacity rounded-full" />
            <div className="flex items-center pl-2 gap-3 z-10">
              <div
                className={cn(
                  "w-10 h-10 border rounded-full flex items-center justify-center font-mono font-bold text-[14px] leading-[20px] transition-colors",
                  letterBg,
                  letterText,
                  letterBorder
                )}
              >
                {option.id}
              </div>
              <span
                className={cn(
                  "font-mono font-semibold text-[14px] leading-[20px] tracking-[0.35px] transition-colors",
                  optionTextClass
                )}
              >
                {option.text}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// --- SUBMIT BUTTON ---
interface NightSubmitButtonProps {
  isSubmitted: boolean;
  hasSelection: boolean;
  onSubmit: () => void;
}

export const NightSubmitButton: React.FC<NightSubmitButtonProps> = ({
  isSubmitted,
  hasSelection,
  onSubmit,
}) => {
  const isDisabled = isSubmitted || !hasSelection;

  return (
    <div className="w-full mt-4 flex justify-center items-start z-40">
      <button
        onClick={onSubmit}
        disabled={isDisabled}
        className={cn(
          "w-full h-14 bg-rose-500/10 border border-rose-500 shadow-[0_0_20px_rgba(255,42,85,0.2)] rounded-full flex justify-center items-center gap-2 transition-all duration-300",
          isDisabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-rose-500/20 hover:shadow-[0_0_30px_rgba(255,42,85,0.4)] active:scale-98 cursor-pointer"
        )}
      >
        <Lock className="h-4 w-4 text-[#FF2A55]" />
        <span className="font-sans font-semibold text-[18px] leading-[28px] tracking-[0.45px] text-[#FF2A55]">
          SUBMIT PROTOCOL
        </span>
      </button>
    </div>
  );
};
