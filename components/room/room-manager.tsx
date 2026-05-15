'use client'

import { useParams } from "next/navigation";
import WaitingRoom from "./waiting-room";
import GameRoom from "./game-room";
import { updateRoomState } from "@/lib/data";
import useSWR from "swr";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function RoomManager() {
    const roomCode = String(useParams().roomcode);
    const { data } = useSWR(roomCode, updateRoomState, {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });

    const roomStatus = data ? data.roomStatus : "waiting";

    return (
        <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-start py-12 px-4 bg-transparent">
            {roomStatus === "waiting" && <WaitingRoom roomCode={roomCode} />}
            {roomStatus === "playing" && <GameRoom roomCode={roomCode} />}
        </main>
    );
}