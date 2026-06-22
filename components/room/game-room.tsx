import { Card, CardContent } from "../ui/card";
import useSWR from "swr";
import UpdateButton from "./update-button";
import { useEffect, useRef, useState } from "react";
import { updateGameState } from "@/lib/data";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function GameRoom({ roomCode }: { roomCode: string }) {
    const [duration, setDuration] = useState(0);
    const [voteValue, setVoteValue] = useState("")
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
    const isVoting = phase?.endsWith("Vote");

    useEffect(() => {
        if (!serverPhaseEndAt) return;
        isPollingRef.current = false;

        const tick = () => {
            const remaining = Math.ceil((serverPhaseEndAt - Date.now()) / 1000);
            console.log(serverPhaseEndAt - Date.now(), remaining)

            if (remaining <= 0) {
                setDuration(0)
                if (!isDev) {
                    mutate(undefined, { revalidate: true }).then((res) => {
                        if (res?.phaseEndAt === serverPhaseEndAt) isPollingRef.current = true;
                    });
                    console.log("force polling...")
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
    }, [serverPhaseEndAt, mutate])

    const minutes = String(Math.round(duration / 60)).padStart(2, "0");
    const seconds = String(duration % 60).padStart(2, "0");

    return (
        <>
            {isDev && <UpdateButton onUpdate={() => mutate()} />}
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
            {isVoting &&
                <Card>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full">
                            <RadioGroup className="max-w-sm" value={voteValue} onValueChange={setVoteValue}>
                                {players?.map((player) => {
                                    return (
                                        <FieldLabel htmlFor={player.id} key={player.id}>
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>{player.name}</FieldTitle>
                                                </FieldContent>
                                                <RadioGroupItem value={player.id} id={player.id} />
                                            </Field>
                                        </FieldLabel>
                                    )
                                })}
                            </RadioGroup>
                            <Button onClick={() => setVoteValue("")}>Not Voting</Button>
                        </div>
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