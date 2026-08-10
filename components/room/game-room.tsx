"use client";

import useSWR, { Fetcher } from "swr";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getPlayerVote } from "@/lib/actions/game";
import { GameState, InGamePlayer } from "@/lib/definitions";
import PhaseLayout from "@/components/phase-layout";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import UptimePhase from "@/components/room/uptime-phase/uptime-phase";
import HangVotePhase from "@/components/room/hearing-phase/hang-vote-phase";
import HangVoteCountPhase from "@/components/room/hearing-phase/hang-vote-count-phase";
import SecurityClearanceResultPhase from "@/components/room/hearing-phase/hang-vote-result-phase";
import DowntimePhase from "@/components/room/downtime-phase/downtime-phase";
import KillVotePhase from "@/components/room/kill-vote-phase/kill-vote-phase";
import KillVoteResultPhase from "@/components/room/kill-vote-phase/kill-vote-result-phase";
import IncidentReportPhase from "@/components/room/incident-report/incident-report-phase";
import EndScreenPhase from "@/components/room/end-screen/end-screen-phase";

const fetcher: Fetcher<{ gameState: GameState, activePlayersIds: string[] }> = (url: string) => fetch(url).then(res => res.json())

export default function GameRoom({ roomCode }: { roomCode: string }) {
  const router = useRouter();
  const [duration, setDuration] = useState(0);
  const [voteValue, setVoteValue] = useState("none");
  const isPollingRef = useRef(false);

  const { data, mutate } = useSWR(`/api/game/${roomCode}`, fetcher,
    {
      refreshInterval: (currentData) => {
        const gameData = currentData?.gameState;
        return isPollingRef.current && gameData?.endGame === "inProgress" ? 2000 : 0;
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 500,
    }
  );

  const gameData = data?.gameState;

  const user = gameData?.user;
  const role = user?.role;
  const serverPhaseEndAt = gameData?.phaseEndAt;
  const phase = gameData?.phase;
  const round = gameData?.round ?? 1;
  const players: InGamePlayer[] = gameData?.players ?? [];
  const allPlayers = useMemo(() => (user ? [user, ...players] : players), [user, players]);

  const isUserBadSide = user?.side === "bad";
  const isUserAlive = user?.status === "alive";
  const voterByCandidate: Record<string, string[]> = gameData?.voterByCandidate ?? {};
  const lastDeadPlayer: InGamePlayer | null = players.find((p) => p.id === gameData?.lastDeadPlayerId) ?? null;
  const isStillPlaying = gameData?.endGame === "inProgress";

  useEffect(() => {
    setVoteValue("none");
  }, [phase]);

  const handlePhaseTransition = useCallback(async () => {
    try {
      if (phase === "hangVote" && isUserAlive) {
        await getPlayerVote(roomCode, voteValue);
      }
      if (phase === "killVote" && isUserBadSide && isUserAlive) {
        await getPlayerVote(roomCode, voteValue);
      }
      await mutate();
    } catch {
      isPollingRef.current = true;
    }
  }, [phase, isUserAlive, isUserBadSide, roomCode, voteValue, mutate]);

  useEffect(() => {
    if (!serverPhaseEndAt) return;
    isPollingRef.current = false;

    const tick = () => {
      const remainingSeconds = Math.ceil((serverPhaseEndAt - Date.now()) / 1000);
      if (remainingSeconds <= 0) {
        setDuration(0);
        isPollingRef.current = true;
        if (isStillPlaying) {
          handlePhaseTransition();
        }
        return true;
      }
      isPollingRef.current = false;
      setDuration(remainingSeconds);
      return false;
    };

    if (tick()) return;

    const timerId = setInterval(() => {
      if (tick()) clearInterval(timerId);
    }, 500);

    return () => clearInterval(timerId);
  }, [serverPhaseEndAt, isStillPlaying, handlePhaseTransition]);

  const formattedMinutes = String(Math.floor(duration / 60)).padStart(2, "0");
  const formattedSeconds = String(duration % 60).padStart(2, "0");

  if (!isStillPlaying) {
    return (
      <EndScreenPhase
        endGame={gameData?.endGame ?? "goodEnd"}
        round={round}
        players={allPlayers}
        onReturnToLobby={() => router.push("/")}
      />
    );
  }

  if (phase === "starting" && isUserAlive) {
    return (
      <PhaseLayout theme="starting">
        <header className="absolute top-0 left-0 w-full h-15.75 bg-slate-950/60 border-b border-cyan/20 backdrop-blur-md z-50 flex items-center justify-center px-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan rounded-full" />
            <span className="font-mono text-xs md:text-sm tracking-[0.2em] text-cyan uppercase opacity-90 text-glow-cyan">
              INITIALIZING PROTOCOL
            </span>
          </div>
        </header>

        <div className="md:hidden flex flex-col justify-between h-full w-full max-w-97.5 mx-auto pt-17.5 pb-6 relative font-mono">
          <div className="flex-1 flex flex-col justify-center items-center gap-8 my-auto z-10">
            <div className="w-24 h-24 rounded-full border border-cyan/30 flex items-center justify-center relative overflow-hidden bg-cyan/5">
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan/20 to-transparent w-full h-1/2 animate-scanline" />
              <User className="w-10 h-10 text-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            </div>

            <div className="text-center space-y-3">
              <h3 className="font-mono text-sm tracking-widest text-zinc-500 uppercase">IDENT_CONFIRMED</h3>
              <div className="space-y-1">
                {role === "hacker" ? (
                  <h2 className="text-4xl font-bold text-[#FF2A55] tracking-widest drop-shadow-[0_0_12px_rgba(255,42,85,0.4)] uppercase">
                    HACKER
                  </h2>
                ) : (
                  <h2 className="text-4xl font-bold text-cyan tracking-widest text-glow-cyan uppercase">
                    USER
                  </h2>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono max-w-70 mx-auto leading-relaxed">
                {role === "hacker"
                  ? "Infiltrate the network. Eliminate the users under the cover of downtime."
                  : "Analyze network activity. Identify and vote out the anomalies before you are compromised."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">LINK_STABILIZING_IN</span>
            <span className="font-mono text-3xl font-bold text-white tracking-widest">
              {formattedMinutes}:{formattedSeconds}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col flex-1 w-full max-w-5xl mx-auto pt-20 pb-8 justify-between font-mono">
          <div className="flex gap-12 items-center justify-center flex-1 my-auto">
            <div className="flex flex-col items-center text-center gap-6 flex-1">
              <div className="w-28 h-28 rounded-full border border-cyan/40 flex items-center justify-center relative overflow-hidden bg-cyan/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan/30 to-transparent w-full h-1/2 animate-scanline" />
                <User className="w-12 h-12 text-cyan drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
              </div>

              <div className="space-y-3">
                <span className="font-mono text-xs tracking-[0.3em] text-cyan/70 uppercase">
                  IDENT_CONFIRMED // CLASSIFIED
                </span>
                {role === "hacker" ? (
                  <h2 className="text-5xl font-extrabold text-[#FF2A55] tracking-[0.15em] drop-shadow-[0_0_20px_rgba(255,42,85,0.5)] uppercase">
                    HACKER
                  </h2>
                ) : (
                  <h2 className="text-5xl font-extrabold text-cyan tracking-[0.15em] text-glow-cyan uppercase">
                    USER
                  </h2>
                )}
                <p className="text-sm text-zinc-300 font-mono max-w-md mx-auto leading-relaxed">
                  {role === "hacker"
                    ? "Infiltrate the network. Eliminate the users under the cover of downtime."
                    : "Analyze network activity. Identify and vote out the anomalies before you are compromised."}
                </p>
              </div>
            </div>

            <div className="w-105 shrink-0 bg-slate-950/70 border border-cyan/20 p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between gap-6 shadow-[0_0_50px_rgba(6,182,212,0.08)]">
              <div className="flex items-center gap-2 border-b border-cyan/20 pb-4">
                <span className="w-2 h-2 bg-cyan rounded-full" />
                <h3 className="font-mono text-xs tracking-[0.2em] text-cyan uppercase font-semibold">
                  MISSION_BRIEF PROTOCOL
                </h3>
              </div>

              <div className="space-y-4 font-mono text-xs text-zinc-400 leading-relaxed">
                {role === "hacker" ? (
                  <>
                    <p className="text-rose-400/90 font-semibold">• PRIMARY: Covert elimination during downtime.</p>
                    <p>• SECONDARY: Blend into discussions during uptime vote.</p>
                    <p>• CAUTION: Avoid suspicious voting patterns.</p>
                  </>
                ) : (
                  <>
                    <p className="text-cyan font-semibold">• PRIMARY: Solve downtime signal quests to earn clues.</p>
                    <p>• SECONDARY: Track vote anomalies during uptime phase.</p>
                    <p>• CAUTION: Hostile entities remain hidden in room.</p>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 pt-4 border-t border-cyan/20 bg-cyan/5 rounded-2xl p-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-cyan/80 uppercase">
                  LINK_STABILIZING_IN
                </span>
                <span className="font-mono text-4xl font-bold text-white tracking-widest text-glow-cyan">
                  {formattedMinutes}:{formattedSeconds}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PhaseLayout>
    );
  }

  switch (phase) {
    case "uptime":
      return (
        <UptimePhase
          round={round}
          timeLeft={duration}
          totalDuration={60}
          players={allPlayers}
        />
      );

    case "hangVote":
      return (
        <HangVotePhase
          players={players}
          timeLeft={duration}
          round={round}
          voteValue={voteValue}
          onVote={setVoteValue}
          isUserAlive={isUserAlive}
        />
      );

    case "hangVoteCount":
    case "killVoteCount":
      return <HangVoteCountPhase round={round} />;

    case "hangVoteResult":
      return (
        <SecurityClearanceResultPhase
          round={round}
          lastDeadPlayer={lastDeadPlayer}
          timeLeft={duration}
        />
      );

    case "downtime":
      return (
        <DowntimePhase
          roomCode={roomCode}
          round={round}
          timeLeft={duration}
          totalDuration={60}
          phaseDuration={60}
        />
      );

    case "killVote":
      return (
        <KillVotePhase
          players={players}
          timeLeft={duration}
          round={round}
          voteValue={voteValue}
          onVote={setVoteValue}
          isUserBadSide={isUserBadSide}
          isUserAlive={isUserAlive}
        />
      );

    case "killVoteResult":
      return (
        <KillVoteResultPhase
          round={round}
          lastDeadPlayer={lastDeadPlayer}
          voterByCandidate={voterByCandidate}
          timeLeft={duration}
          players={allPlayers}
          isUserBadSide={isUserBadSide}
          isUserAlive={isUserAlive}
        />
      );

    case "incidentReport":
      return (
        <IncidentReportPhase
          round={round}
          killDeadPlayer={lastDeadPlayer}
          timeLeft={duration}
        />
      );

    default:
      return (
        <UptimePhase
          round={round}
          timeLeft={duration}
          totalDuration={60}
          players={allPlayers}
        />
      );
  }
}

