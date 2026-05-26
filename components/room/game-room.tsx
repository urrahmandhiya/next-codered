import { Card, CardContent } from "../ui/card";
import useSWR from "swr";
import UpdateButton from "./update-button";
import { useEffect, useState } from "react";
import { updateGameState } from "@/lib/data";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function GameRoom({ roomCode }: { roomCode: string }) {
    const [duration, setDuration] = useState(0); // will not go more than 5 minutes
    const { data, mutate } = useSWR(`gameState-${roomCode}`, () => updateGameState(roomCode), {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });
    const user = data?.user;
    const role = user?.role;
    const serverDuration = Math.floor(Number(data?.phaseEndAt)/ 1000);
    const phase = data?.phase;
    const round = data?.round;

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