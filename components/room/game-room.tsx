import { Card, CardContent } from "../ui/card";
import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { updateGameState } from "@/lib/data";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { getPlayerVote } from "@/lib/actions/game";
import { InGamePlayer } from "@/lib/definitions";
import VotePlayerList from "../game/vote-player-list";
import NightPhase from "./night-phase/night-phase";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function GameRoom({ roomCode }: { roomCode: string }) {
    const [duration, setDuration] = useState(0);
    const [voteValue, setVoteValue] = useState("none")
    const isPollingRef = useRef(false);

    const { data, mutate } = useSWR(`gameState-${roomCode}`, () => updateGameState(roomCode), {
        refreshInterval: (currentData) => (isPollingRef.current && currentData?.endGame === "inProgress") ? 2000 : 0,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        dedupingInterval: 500,
    });
    const user = data?.user;
    const role = user?.role;
    const serverPhaseEndAt = data?.phaseEndAt;
    const phase = data?.phase;
    const round = data?.round;
    const players = data?.players ?? [];
    const isHangVoting = phase === "hangVote";
    const isKillVoting = phase === "killVote";
    const isUserBadSide = user?.side === "bad";
    const isUserAlive = user?.status === "alive";
    const isCounting = phase?.endsWith("Count");
    const isResulting = phase?.endsWith("Result");
    const lastDeadPlayer: InGamePlayer = (players ?? [])?.filter((player) => player.id === data?.lastDeadPlayerId)[0];
    const voterByCandidate: Record<string, string[]> = data?.voterByCandidate ?? {};
    const isStillPlaying = data?.endGame === "inProgress";

    useEffect(() => {
        if (!serverPhaseEndAt) return;
        isPollingRef.current = false;

        const handleMutate = async () => {
            try {
                if (phase === "hangVote" && isUserAlive) {
                    if (voteValue === "none") {
                        console.log("[Getting Vote] not voting")
                    } else {
                        console.log("[Getting Vote] voting for", players?.filter((player) => player.id === voteValue)[0].name)
                    }
                    await getPlayerVote(roomCode, voteValue);
                }
                if (phase === "killVote" && user?.side === "bad" && isUserAlive) {
                    if (voteValue === "none") {
                        console.log("[Getting Vote] not voting")
                    } else {
                        console.log("[Getting Vote] voting for", players?.filter((player) => player.id === voteValue)[0].name)
                    }
                    await getPlayerVote(roomCode, voteValue);
                }
                const result = await mutate();
                console.log("[Phase Transition] into", result?.phase);

                // isPollingRef.current = true;
                // console.log("[Force Polling]")
            } catch (error) {
                console.log(error instanceof Error ? error.message : error)
                isPollingRef.current = true;
                console.log("[Force Polling]")
            }
        }

        const tick = () => {
            const remaining = Math.ceil((serverPhaseEndAt - Date.now()) / 1000);
            console.log(serverPhaseEndAt - Date.now(), remaining)

            if (remaining <= 0) {
                setDuration(0)
                if (!isDev) {
                    isPollingRef.current = true;
                    console.log("[Force Polling]")
                    if (isStillPlaying) {
                        handleMutate();
                    }
                }
                return true;
            }
            isPollingRef.current = false;
            setDuration(remaining);
            return false;
        }
        if (tick()) return;

        const id = setInterval(() => {
            if (tick()) clearInterval(id);
        }, 500);

        return () => clearInterval(id);
    }, [mutate, phase, roomCode, serverPhaseEndAt, voteValue])

    const minutes = String(Math.round(duration / 60)).padStart(2, "0");
    const seconds = String(duration % 60).padStart(2, "0");

    const isNightPhase = phase === "night";

    return (
        <>
            {isStillPlaying ? (
                isNightPhase && isUserAlive ? (
                    !isUserBadSide ? (
                        <NightPhase
                            roomCode={roomCode}
                            round={round ?? 0}
                            timeLeft={duration}
                            totalDuration={15}
                        />
                    ) : (
                        <div className="w-full max-w-[390px] h-[780px] bg-[#020617] border border-[#FF2A55]/20 rounded-[32px] shadow-[0_0_80px_rgba(255,42,85,0.08)] flex flex-col items-center justify-center p-6 text-center">
                            <h2 className="text-2xl font-bold text-[#FF2A55] tracking-widest uppercase mb-4 animate-pulse">
                                ESTABLISHING UPLINK
                            </h2>
                            <p className="text-sm text-rose-300/70 font-mono">
                                Maintaining radio silence. Waiting for coordinates of the decryption targets.
                            </p>
                        </div>
                    )
                ) : (
                    <>
                    <Card>
                        <CardContent>
                            <div className="flex">
                                <div>
                                    <span>{minutes[0]}</span><span>{minutes[1]}</span>
                                </div>
                                <div>:</div>
                                <div>
                                    <span>{seconds[0]}</span><span>{seconds[1]}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {(!isUserAlive) &&
                        <Card>
                            <CardContent>
                                YOU ARE DEAD
                            </CardContent>
                        </Card>
                    }
                    {(isHangVoting && isUserAlive) &&
                        <VotePlayerList voteType="hangVote" players={players} onVote={setVoteValue} voteValue={voteValue} />
                    }
                    {(isKillVoting && isUserBadSide && isUserAlive) &&
                        <VotePlayerList voteType="killVote" players={players} onVote={setVoteValue} voteValue={voteValue} />
                    }
                    {(isCounting && isUserAlive && phase === "hangVoteCount") &&
                        <Card>
                            <CardContent>
                                HANG VOTE RESULT
                                <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full flex-col">
                                    {Object.keys(voterByCandidate).length &&
                                        Object.entries(voterByCandidate).map(([voted, voters]) =>
                                            <div className="flex justify-center items-center" key={voted}>{voted} Voted By :
                                                {voters.map((voter, idx) => <div key={voter}>{voter}{idx < voters.length - 1 ? ',' : ''}</div>)}
                                            </div>
                                        )
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    }
                    {(isCounting && isUserAlive && phase === "killVoteCount") &&
                        <Card>
                            <CardContent>
                                {isUserBadSide ? "KILL VOTE RESULT" : "WAITING FOR MORNING"}
                                <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full flex-col">
                                    {(!!Object.keys(voterByCandidate).length && isUserBadSide) &&
                                        Object.entries(voterByCandidate).map(([voted, voters]) =>
                                            <div className="flex justify-center items-center" key={voted}>{voted} Voted By :
                                                {voters.map((voter, idx) => <div key={voter}>{voter}{idx < voters.length - 1 ? ',' : ''}</div>)}
                                            </div>
                                        )
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    }
                    {(isResulting && isUserAlive) &&
                        <Card>
                            <CardContent>
                                {(lastDeadPlayer)
                                    ?
                                    <span>
                                        {lastDeadPlayer.name} the {lastDeadPlayer.role} the is dead
                                    </span>
                                    :
                                    <span>
                                        no one is dead
                                    </span>
                                }
                            </CardContent>
                        </Card>
                    }
                    <Card>
                        <CardContent>
                            <p>You are: {user && user.name}</p>
                            <p>Your Role is: {role}</p>
                            <p>Current Phase is: {phase}</p>
                            <p>Current Round is: {round}</p>
                            <p>This is the game room</p>
                        </CardContent>
                    </Card>
                </>
                )
            ) : (
                <Card>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full flex-col">
                            <div className="flex justify-center">
                                <span>{data?.endGame === "goodEnd" ? "GOOD SIDE" : "BAD SIDE"} WON</span>
                            </div>
                            <div className="flex w-full gap-4 justify-center items-center">
                                {user?.name}
                                <span>{user?.status === "dead" ? "DEAD" : "ALIVE"}</span>
                                {user?.role}
                            </div>
                            <div>
                                {players?.map((player) => {
                                    return (
                                        <FieldLabel htmlFor={player.id} key={player.id}>
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>
                                                        {player.name}
                                                        <span>{player.status === "dead" ? "DEAD" : "ALIVE"}</span>
                                                        {player.role}
                                                    </FieldTitle>
                                                </FieldContent>
                                            </Field>
                                        </FieldLabel>
                                    )
                                })}
                            </div>
                            <p>Round played: {data?.round}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}