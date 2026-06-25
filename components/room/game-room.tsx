import { Card, CardContent } from "../ui/card";
import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { updateGameState } from "@/lib/data";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import clsx from "clsx";
import { getPlayerVote } from "@/lib/actions/game";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function GameRoom({ roomCode }: { roomCode: string }) {
    const [duration, setDuration] = useState(0);
    const [voteValue, setVoteValue] = useState("none")
    const isPollingRef = useRef(false);

    const { data, mutate } = useSWR(`gameState-${roomCode}`, () => updateGameState(roomCode), {
        refreshInterval: () => isPollingRef.current ? 2000 : 0,
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
    const players = data?.players;
    const isHangVoting = phase === "hangVote";
    const isKillVoting = phase === "killVote";
    const isUserBadSide = user?.side === "bad";
    const isUserAlive = user?.status === "alive";
    const isCounting = phase?.endsWith("Count");
    const isResulting = phase?.endsWith("Result");
    const lastDeadPlayerName = data?.lastDeadPlayerName;

    useEffect(() => {
        if (!serverPhaseEndAt) return;
        isPollingRef.current = false;

        const handleMutate = async () => {
            try {
                if (phase === "hangVote") {
                    if (voteValue === "none") {
                        console.log("[Getting Vote] not voting")
                    } else {
                        console.log("[Getting Vote] voting for", players?.filter((player) => player.id === voteValue)[0].name)
                    }
                    await getPlayerVote(roomCode, voteValue);
                }
                if (phase === "killVote" && user?.side === "bad") {
                    if (voteValue === "none") {
                        console.log("[Getting Vote] not voting")
                    } else {
                        console.log("[Getting Vote] voting for", players?.filter((player) => player.id === voteValue)[0].name)
                    }
                    await getPlayerVote(roomCode, voteValue);
                }
                const result = await mutate();
                console.log("[Phase Transition] into", result?.phase);

                isPollingRef.current = true;
                console.log("[Force Polling]")
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
                    handleMutate();
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

    return (
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
                <Card>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full">
                            <RadioGroup className="max-w-sm" value={voteValue} onValueChange={setVoteValue}>
                                {players?.map((player) => {
                                    return (
                                        <FieldLabel htmlFor={player.id} key={player.id}>
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle className={clsx({
                                                        'text-red-500': player.side === 'bad',
                                                    })}>
                                                        {player.name}
                                                        {player.status === "dead" && <span>DEAD</span>}
                                                    </FieldTitle>
                                                </FieldContent>
                                                <RadioGroupItem value={player.id} id={player.id} disabled={player.status === "dead"} />
                                            </Field>
                                        </FieldLabel>
                                    )
                                })}
                            </RadioGroup>
                            <Button onClick={() => setVoteValue("none")}>Not Voting</Button>
                        </div>
                    </CardContent>
                </Card>
            }
            {(isKillVoting && isUserBadSide && isUserAlive) &&
                <Card>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full">
                            <RadioGroup className="max-w-sm" value={voteValue} onValueChange={setVoteValue}>
                                {players
                                    ?.filter((player) => player.side !== "bad")
                                    .map((player) => {
                                        return (
                                            <FieldLabel htmlFor={player.id} key={player.id}>
                                                <Field orientation="horizontal">
                                                    <FieldContent>
                                                        <FieldTitle>
                                                            {player.name}
                                                        </FieldTitle>
                                                    </FieldContent>
                                                    <RadioGroupItem value={player.id} id={player.id} disabled={player.status === "dead"} />
                                                </Field>
                                            </FieldLabel>
                                        )
                                    })}
                            </RadioGroup>
                            <Button onClick={() => setVoteValue("none")}>Not Voting</Button>
                        </div>
                    </CardContent>
                </Card>
            }
            {(isCounting && isUserAlive) &&
                <Card>
                    <CardContent>
                        {isUserBadSide ? "COUNTING VOTES...." : "WAITING FOR MORNING"}
                    </CardContent>
                </Card>
            }
            {(isResulting && isUserAlive) &&
                <Card>
                    <CardContent>
                        {lastDeadPlayerName} is dead;
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
    );
}