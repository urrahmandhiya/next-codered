"use client"

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { getRoomState, Player } from "@/app/actions";
import { RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";



export default function Page() {
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
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
                <Button variant="outline" onClick={() => updateRoomState(roomCode)}><RefreshCw /></Button>
                <Tabs defaultValue="overview" className="min-w-64">
                    <TabsList>
                        <TabsTrigger value="overview">Players {`[${numPlayersInRoom}/${MAX_NUMBER_OF_PLAYERS}]`}</TabsTrigger>
                        <TabsTrigger value="room-settings">Room Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <Card>
                            <CardContent className="text-sm text-muted-foreground">
                                <ItemGroup>
                                    {players.map((player) => (
                                        <Item key={player.name} variant="outline">
                                            <ItemContent>
                                                <ItemTitle className="flex justify-between w-full">
                                                    {player.name}
                                                    {player.isHost && <Badge variant="outline">Host</Badge>}
                                                </ItemTitle>
                                            </ItemContent>
                                        </Item>
                                    ))}
                                </ItemGroup>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="room-settings">
                        <Card>
                            <CardContent className="text-sm text-muted-foreground">
                                not yet.
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                    <Button variant="outline">Start Game</Button>
                </div>
            </main>
        </div>
    );
}