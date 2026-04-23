'use client'

import { getRoomState } from "@/lib/actions";
import { useParams } from "next/navigation";
import UpdateButton from "./update-button";
import useSWR from "swr";
import WaitingRoom from "./waiting-room";
import GameRoom from "./game-room";
import { Player } from "@/lib/definitions";

async function updateRoomState(roomCode: string) {
    const { room } = await getRoomState(roomCode);
    if (!room) {
        throw new Error('room not found');
    }
    console.log("FETCHING....")
    return room;
};

export default function RoomManager() {
    const roomCode = String(useParams().roomcode);
    const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

    const { data: room, error, isLoading, isValidating, mutate } = useSWR(roomCode, updateRoomState, {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });

    if (error) console.log(error);

    const players = room?.players as Player[];
    const currentPlayers = room?.currentPlayer || 0;
    const maxPlayers = room?.maxPlayer || 0;
    const roomStatus = room?.status;

    return (
        <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-around py-32 px-16 bg-white dark:bg-black">
            {isDev && <UpdateButton onUpdate={() => mutate()} />}
            {roomStatus === "waiting" &&
                <WaitingRoom
                    players={players}
                    currentPlayers={currentPlayers}
                    maxPlayers={maxPlayers}
                    isLoading={isLoading}
                    isValidating={isValidating}
                    roomCode={roomCode}
                />
            }
            {
                roomStatus === "playing" &&
                <GameRoom
                    players={players}
                />
            }
        </main>
    );
}