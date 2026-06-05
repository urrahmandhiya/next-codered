'use client'

import { useParams, useRouter } from "next/navigation";
import WaitingRoom from "./waiting-room";
import GameRoom from "./game-room";
import { updateRoomState } from "@/lib/data";
import useSWR from "swr";
import { useUserCookies } from "./cookie-provider";
import { useEffect, useState } from "react";
import { Player } from "@/lib/definitions";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function RoomManager() {
    const roomCode = String(useParams().roomcode);
    const router = useRouter();
    const userId = useUserCookies();
    const [hasFetched, setHasFetched] = useState(false);

    const { data, error } = useSWR(roomCode, updateRoomState, {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: true,
        onSuccess: () => setHasFetched(true),
        onError: () => setHasFetched(true),
    });

    useEffect(() => {
        if (!hasFetched) return;

        const isRoomInvalid = error;
        const isPlayerMissing = data && !data.players.some((p: Player) => p.id === userId);

        if (isRoomInvalid || isPlayerMissing) {
            router.push("/");
        }
    }, [data, error, hasFetched, userId, router]);

    const roomStatus = data ? data.roomStatus : "waiting";

    return (
        <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-start py-12 px-4 bg-transparent">
            {roomStatus === "waiting" && <WaitingRoom roomCode={roomCode} />}
            {roomStatus === "playing" && <GameRoom roomCode={roomCode} />}
        </main>
    );
}