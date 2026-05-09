import { Card, CardContent } from "../ui/card";
import { Player } from "@/lib/definitions";
import { updateRoomState } from "@/lib/data";
import useSWR from "swr";
import { useUserCookies } from "./cookie-provider";
import UpdateButton from "./update-button";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function GameRoom({ roomCode }: {roomCode: string}) {
    const userId = useUserCookies();
    const { data, mutate} = useSWR(roomCode, updateRoomState, {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });
    const players = data?.players as Player[];
    const player = players.filter(player => player.id == String(userId))[0];
    const role = player.role;
    return (
        <>
        {isDev && <UpdateButton onUpdate={() => mutate()}/>}
        <Card>
            <CardContent>
                <p>You are: {player && player.name}</p>
                <p>Your Role is: {role}</p>
                <p>This is the game room</p>
            </CardContent>
        </Card>
        </>
    );
}