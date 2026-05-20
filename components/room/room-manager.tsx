'use client'

import { useParams, useRouter } from "next/navigation";
import WaitingRoom from "./waiting-room";
import GameRoom from "./game-room";
import { updateRoomState } from "@/lib/data";
import useSWR from "swr";
import { useUserCookies } from "./cookie-provider";
import { useEffect } from "react";
import { Player } from "@/lib/definitions";

export default function RoomManager() {
    const roomCode = String(useParams().roomcode);
    const router = useRouter();
    const userId = useUserCookies();

    const { data, error, isLoading } = useSWR(roomCode, updateRoomState, {
        refreshInterval: 3000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });

    useEffect(() => {
        if (isLoading) return;

        const isRoomInvalid = error;
        const isPlayerMissing = data && !data.players.some((p: Player) => p.id === userId);

        if (isRoomInvalid || isPlayerMissing) {
            router.push("/");
        }
    }, [data, error, isLoading, userId, router]);

    const roomStatus = data ? data.roomStatus : "waiting";

    return (
        <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-start py-12 px-4 bg-transparent">
            {roomStatus === "waiting" && <WaitingRoom roomCode={roomCode} />}
            {roomStatus === "playing" && <GameRoom roomCode={roomCode} />}
        </main>
    );
}