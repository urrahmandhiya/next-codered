'use client'

import { useParams, useRouter } from "next/navigation";
import useSWR, { Fetcher } from "swr";
import { useEffect, useState } from "react";
import { Player, Room } from "@/lib/definitions";
import WaitingRoom from "@/components/room/waiting-room";
import GameRoom from "@/components/room/game-room";
import RoomAborted from "@/components/room/room-aborted";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";
const fetcher: Fetcher<{ room: Room, userId: string }> = (url: string) => fetch(url).then(res => res.json())

export default function RoomManager() {
    const roomCode = String(useParams().roomcode);
    const router = useRouter();
    const [hasFetched, setHasFetched] = useState(false);

    const { data, error } = useSWR(`/api/room/${roomCode}`, fetcher, {
        refreshInterval: (currentData) => {
            const roomData = currentData?.room;
            const isGameRunning = roomData?.roomStatus === "playing";
            const isStartingPhaseOver = roomData?.phase !== "starting";
            const isRoomAborting = roomData?.roomStatus === "aborted";
            if (isRoomAborting) return 0;
            if (isGameRunning && isStartingPhaseOver) return 0;
            return isDev ? 0 : 5000;
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: true,
        onSuccess: () => setHasFetched(true),
        onError: () => setHasFetched(true),
    });

    useEffect(() => {
        if (!hasFetched) return;

        const roomData = data?.room;
        const userId = data?.userId;
        const isRoomInvalid = error;
        const isPlayerMissing = data && !roomData?.players.some((p: Player) => p.id === userId);

        if (isRoomInvalid || isPlayerMissing) {
            router.push("/");
        }
    }, [data, error, hasFetched, router]);

    const roomData = data?.room;
    const roomStatus = roomData ? roomData.roomStatus : "waiting";

    return (
        <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-center py-12 px-4 bg-transparent">
            {roomStatus === "waiting" && <WaitingRoom roomCode={roomCode} />}
            {roomStatus === "playing" && <GameRoom roomCode={roomCode} />}
            {roomStatus === "aborted" && <RoomAborted action={() => router.push("/")} />}
        </main>
    );
}
