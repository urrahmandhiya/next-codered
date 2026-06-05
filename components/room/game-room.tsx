import { Card, CardContent } from "../ui/card";
import useSWR from "swr";
import UpdateButton from "./update-button";
import { useEffect, useState } from "react";
import { updateGameState } from "@/lib/data";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function GameRoom({ roomCode }: { roomCode: string }) {
    const [duration, setDuration] = useState(0);
    const [voteValue, setVoteValue] = useState("")

    const { data, mutate } = useSWR(`gameState-${roomCode}`, () => updateGameState(roomCode), {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });
    const user = data?.user;
    const role = user?.role;
    const serverDuration = Math.floor(Number(data?.phaseEndAt) / 1000);
    const phase = data?.phase;
    const round = data?.round;
    const players = data?.players;
    const isVoting = phase?.endsWith("Vote");

    useEffect(() => {
        const updateTimer = (time: number) => {
            setDuration(time)
        }
        updateTimer(serverDuration);
        const id = setInterval(() => {
            setDuration((prev) => {
                if (prev < 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            })
        }, 1000)
        return () => clearInterval(id);
    }, [serverDuration])

    const minutes = String(Math.floor(duration / 60)).padStart(2, "0");
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