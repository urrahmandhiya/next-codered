'use client'

import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { getRoomState, Player } from "@/app/actions";
import { useParams } from "next/navigation";
import RoomSettings from "./room-settings";
import PlayerList from "./player-list";
import UpdateButton from "./update-button";
import useSWR from "swr";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

async function updateRoomState(roomCode: string) {
    const { room } = await getRoomState(roomCode);
    if (!room) {
        throw new Error('room not found');
    }
    console.log("FETCHING....")
    return room;
};

export default function WaitingRoom() {
    const MAX_NUMBER_OF_PLAYERS = 4;
    const roomCode = String(useParams().roomcode);
    const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

    const { data: room, error, isLoading, mutate } = useSWR(roomCode, updateRoomState, {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });

    const players = room?.players as Player[];
    const currentPlayers = room?.currentPlayer || 0;

    return (
        <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
            {isDev && <UpdateButton onUpdate={() => mutate()} />}
            <Tabs defaultValue="overview" className="min-w-64">
                <TabsList>
                    <TabsTrigger value="overview">Players {`[${currentPlayers}/${MAX_NUMBER_OF_PLAYERS}]`}</TabsTrigger>
                    <TabsTrigger value="room-settings">Room Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    {isLoading
                        ?
                        <Card className="w-full">
                            <CardContent>
                                <Skeleton className="aspect-video w-full" />
                            </CardContent>
                        </Card>
                        : <PlayerList players={players} />
                    }
                </TabsContent>
                <TabsContent value="room-settings">
                    <RoomSettings />
                </TabsContent>
            </Tabs>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                <Button variant="outline">Start Game</Button>
            </div>
        </main>
    );
}