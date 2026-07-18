"use client";

import useSWR from "swr";
import { useEffect, useRef, useState, useCallback } from "react";
import { updateGameState } from "@/lib/data";
import { getPlayerVote } from "@/lib/actions/game";
import { InGamePlayer } from "@/lib/definitions";
import { Card, CardContent } from "../ui/card";
import VotePlayerList from "../game/vote-player-list";
import PhaseLayout from "@/components/phase-layout";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function GameRoom({ roomCode }: { roomCode: string }) {
  const router = useRouter();
  const [duration, setDuration] = useState(0);
  const [voteValue, setVoteValue] = useState("none");
  const isPollingRef = useRef(false);

  const { data, mutate } = useSWR(
    `gameState-${roomCode}`,
    () => updateGameState(roomCode),
    {
      refreshInterval: (currentData) =>
        isPollingRef.current && currentData?.endGame === "inProgress" ? 2000 : 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 500,
    }
  );

  const user = data?.user;
  const role = user?.role;
  const serverPhaseEndAt = data?.phaseEndAt;
  const phase = data?.phase;
  const round = data?.round;
  const players: InGamePlayer[] = data?.players ?? [];
  const isHangVoting = phase === "hangVote";
  const isKillVoting = phase === "killVote";
  const isUserBadSide = user?.side === "bad";
  const isUserAlive = user?.status === "alive";
  const isCounting = phase?.endsWith("Count");
  const voterByCandidate: Record<string, string[]> = data?.voterByCandidate ?? {};
  const lastDeadPlayer: InGamePlayer | undefined = players.find((p) => p.id === data?.lastDeadPlayerId);
  const isStillPlaying = data?.endGame === "inProgress";

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
      <Card className="w-full max-w-md bg-[#0A050B]/80 border-slate-800 text-slate-100 p-6 backdrop-blur-md shadow-2xl rounded-3xl font-mono">
        <CardContent className="space-y-4 p-0">
          <h2 className="text-xl font-bold text-center text-cyan-400">
            GAME OVER // {data?.endGame === "goodEnd" ? "GOOD SIDE WON" : "BAD SIDE WON"}
          </h2>
          <div className="space-y-2 text-sm border-t border-slate-800/80 pt-4">
            <p>User: {user?.name} ({user?.status})</p>
            <p>Role: {user?.role}</p>
            <p>Total Rounds: {round}</p>
          </div>
          <div className="space-y-1 border-t border-slate-800/80 pt-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Player Roster</p>
            {players.map((p) => (
              <div key={p.id} className="flex justify-between text-xs py-1 border-b border-slate-800/40">
                <span>{p.name} ({p.status})</span>
                <span className="text-cyan-400">{p.role}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-200 transition-all"
          >
            Return to Home
          </button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "starting" && isUserAlive) {
    return (
      <PhaseLayout theme="starting">
        <header className="absolute top-0 left-0 w-full h-[63px] bg-slate-950/60 border-b border-cyan/20 backdrop-blur-md z-50 flex items-center justify-center px-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan rounded-full" />
            <span className="font-mono text-xs md:text-sm tracking-[0.2em] text-cyan uppercase opacity-90 text-glow-cyan">
              INITIALIZING PROTOCOL
            </span>
          </div>
        </header>

        <div className="md:hidden flex flex-col justify-between h-full w-full max-w-[390px] mx-auto pt-[70px] pb-6 relative font-mono">
          <div className="flex-1 flex flex-col justify-center items-center gap-8 my-auto z-10">
            <div className="w-24 h-24 rounded-full border border-cyan/30 flex items-center justify-center relative overflow-hidden bg-cyan/5">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/20 to-transparent w-full h-1/2 animate-scanline" />
              <User className="w-10 h-10 text-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            </div>

            <div className="text-center space-y-3">
              <h3 className="font-mono text-sm tracking-widest text-zinc-500 uppercase">IDENT_CONFIRMED</h3>
              <div className="space-y-1">
                {role === "werewolf" ? (
                  <h2 className="text-4xl font-bold text-[#FF2A55] tracking-[0.1em] drop-shadow-[0_0_12px_rgba(255,42,85,0.4)] uppercase">
                    WEREWOLF
                  </h2>
                ) : (
                  <h2 className="text-4xl font-bold text-cyan tracking-[0.1em] text-glow-cyan uppercase">
                    VILLAGER
                  </h2>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono max-w-[280px] mx-auto leading-relaxed">
                {role === "werewolf"
                  ? "Infiltrate the network. Eliminate the villagers under the cover of night."
                  : "Analyze network activity. Identify and vote out the anomalies before you are compromised."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">LINK_STABILIZING_IN</span>
            <span className="font-mono text-3xl font-bold text-white tracking-[0.1em]">
              {formattedMinutes}:{formattedSeconds}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col flex-1 w-full max-w-5xl mx-auto pt-[80px] pb-8 justify-between font-mono">
          <div className="flex gap-12 items-center justify-center flex-1 my-auto">
            <div className="flex flex-col items-center text-center gap-6 flex-1">
              <div className="w-28 h-28 rounded-full border border-cyan/40 flex items-center justify-center relative overflow-hidden bg-cyan/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/30 to-transparent w-full h-1/2 animate-scanline" />
                <User className="w-12 h-12 text-cyan drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
              </div>

              <div className="space-y-3">
                <span className="font-mono text-xs tracking-[0.3em] text-cyan/70 uppercase">
                  IDENT_CONFIRMED // CLASSIFIED
                </span>
                {role === "werewolf" ? (
                  <h2 className="text-5xl font-extrabold text-[#FF2A55] tracking-[0.15em] drop-shadow-[0_0_20px_rgba(255,42,85,0.5)] uppercase">
                    WEREWOLF
                  </h2>
                ) : (
                  <h2 className="text-5xl font-extrabold text-cyan tracking-[0.15em] text-glow-cyan uppercase">
                    VILLAGER
                  </h2>
                )}
                <p className="text-sm text-zinc-300 font-mono max-w-md mx-auto leading-relaxed">
                  {role === "werewolf"
                    ? "Infiltrate the network. Eliminate the villagers under the cover of night."
                    : "Analyze network activity. Identify and vote out the anomalies before you are compromised."}
                </p>
              </div>
            </div>

            <div className="w-[420px] shrink-0 bg-slate-950/70 border border-cyan/20 p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between gap-6 shadow-[0_0_50px_rgba(6,182,212,0.08)]">
              <div className="flex items-center gap-2 border-b border-cyan/20 pb-4">
                <span className="w-2 h-2 bg-cyan rounded-full" />
                <h3 className="font-mono text-xs tracking-[0.2em] text-cyan uppercase font-semibold">
                  MISSION_BRIEF PROTOCOL
                </h3>
              </div>

              <div className="space-y-4 font-mono text-xs text-zinc-400 leading-relaxed">
                {role === "werewolf" ? (
                  <>
                    <p className="text-rose-400/90 font-semibold">• PRIMARY: Covert elimination during night downtime.</p>
                    <p>• SECONDARY: Blend into discussions during day vote.</p>
                    <p>• CAUTION: Avoid suspicious voting patterns.</p>
                  </>
                ) : (
                  <>
                    <p className="text-cyan font-semibold">• PRIMARY: Solve downtime signal quests to earn clues.</p>
                    <p>• SECONDARY: Track vote anomalies during day phase.</p>
                    <p>• CAUTION: Hostile entities remain hidden in room.</p>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 pt-4 border-t border-cyan/20 bg-cyan/5 rounded-2xl p-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-cyan/80 uppercase">
                  LINK_STABILIZING_IN
                </span>
                <span className="font-mono text-4xl font-bold text-white tracking-[0.1em] text-glow-cyan">
                  {formattedMinutes}:{formattedSeconds}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PhaseLayout>
    );
  }

  return (
    <Card className="w-full max-w-md bg-[#0A050B]/80 border-slate-800 text-slate-100 p-6 backdrop-blur-md shadow-2xl rounded-3xl font-mono">
      <CardContent className="space-y-6 p-0">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Phase</span>
            <span className="text-lg font-bold text-cyan-400 uppercase">{phase}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Round {round}</span>
            <span className="text-2xl font-bold text-white">
              {formattedMinutes}:{formattedSeconds}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between">
            <span className="text-slate-400">Player:</span>
            <span className="font-semibold text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Role / Side:</span>
            <span className="font-semibold text-cyan-400">{role} ({user?.side})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className={isUserAlive ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
              {user?.status}
            </span>
          </div>
        </div>

        {isHangVoting && isUserAlive && (
          <div className="space-y-3">
            <span className="text-xs text-amber-400 uppercase tracking-wider font-bold block">
              Cast Vote (Security Clearance Hearing)
            </span>
            <VotePlayerList
              voteType="hangVote"
              players={players.filter((p) => p.status === "alive")}
              onVote={setVoteValue}
              voteValue={voteValue}
            />
          </div>
        )}

        {isKillVoting && (
          isUserBadSide && isUserAlive ? (
            <div className="space-y-3">
              <span className="text-xs text-rose-400 uppercase tracking-wider font-bold block">
                Cast Target (Silent Protocol - Werewolf Target Pick)
              </span>
              <VotePlayerList
                voteType="killVote"
                players={players.filter((p) => p.status === "alive")}
                onVote={setVoteValue}
                voteValue={voteValue}
              />
            </div>
          ) : (
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-center space-y-1">
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider block">
                WAITING FOR MORNING
              </span>
              <p className="text-[11px] text-slate-400">
                Covert operations active. Reconnecting node link coordinates.
              </p>
            </div>
          )
        )}

        {phase === "hangVoteResult" && (
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1 text-center font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              SECURITY CLEARANCE RESULT
            </span>
            {lastDeadPlayer ? (
              <div className="space-y-1">
                <p className="text-base text-rose-400 font-bold uppercase">{lastDeadPlayer.name}</p>
                <p className="text-xs text-slate-300 uppercase">Role: {lastDeadPlayer.role}</p>
              </div>
            ) : (
              <p className="text-base text-cyan-400 font-bold uppercase">NONE</p>
            )}
          </div>
        )}

        {isCounting && (
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold">
              Vote Tally Breakdown
            </span>
            {Object.keys(voterByCandidate).length > 0 ? (
              Object.entries(voterByCandidate).map(([candidateId, voters]) => (
                <div key={candidateId} className="flex justify-between text-xs py-1 border-b border-slate-800/40">
                  <span>Candidate: {candidateId}</span>
                  <span className="text-slate-400">Voters: {voters.join(", ")}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No votes cast.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}