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
import { useEffect, useState } from "react";
import RoomSettings from "./room-settings";
import PlayerList from "./player-list";
import UpdateButton from "./update-button";


export default function WaitingRoom() {
    const MAX_NUMBER_OF_PLAYERS = 4;
    const roomCode = String(useParams().roomcode);
    const [players, setPlayers] = useState<Player[]>([]);
    const [numPlayersInRoom, setNumPlayersInRoom] = useState(0)

    async function updateRoomState(roomCode: string) {
        const { room } = await getRoomState(roomCode);
        console.log(room)
        if (!room) {
            throw new Error('room not found');
        }

        const playersInRoom = room.players;

        setPlayers(playersInRoom);
        setNumPlayersInRoom(room.currentPlayer);
    };

    useEffect(() => {
        async function fetchRoom() {
            try {
                updateRoomState(roomCode)
            } catch (error) {
                console.log(error)
            }
        }
        fetchRoom();
    }, [roomCode])

    return (
        <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
            <UpdateButton onUpdate={() => updateRoomState(roomCode)}/>
            <Tabs defaultValue="overview" className="min-w-64">
                <TabsList>
                    <TabsTrigger value="overview">Players {`[${numPlayersInRoom}/${MAX_NUMBER_OF_PLAYERS}]`}</TabsTrigger>
                    <TabsTrigger value="room-settings">Room Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <PlayerList players={players}/>
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