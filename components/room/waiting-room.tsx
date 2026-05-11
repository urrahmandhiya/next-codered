"use client"

import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import PlayerList from "./player-list";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { startGame } from "@/lib/actions/room";
import RoomSettings from "./room-settings";
import { useState, useTransition } from "react";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Player } from "@/lib/definitions";
import UpdateButton from "./update-button";
import { updateRoomState } from "@/lib/data";
import useSWR from "swr";
import { useUserCookies } from "./cookie-provider";
import PlayerNameChange from "./player-name.change";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function WaitingRoom({ roomCode }: { roomCode: string }) {
    const [isPending, startTransition] = useTransition();
    const [alertMessage, setAlertMessage] = useState("");
    const [isStarting, setIsStarting] = useState(false);

    const { data, isLoading, mutate } = useSWR(roomCode, updateRoomState, {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });

    const userId = useUserCookies();

    const playersInRoom = data?.playersInRoom || 0;
    const maxPlayersInRoom = data?.maxPlayersInRoom || 0;
    const players = data?.players as Player[];
    const isHost = data?.roomHostId === userId;
    const roles = data?.roles || [];
    const totalRoles = data?.roles.reduce((acc, curr) => acc += Number(curr.amount), 0) || 0;

    const handleStartGame = () => {
        startTransition(async () => {
            const result = await startGame(roomCode);
            if (result?.success === false) {
                setAlertMessage(result.error)
            } else {
                setIsStarting(true);
            }
        })
    }

    return (
        <>
            {isDev && <UpdateButton onUpdate={() => mutate()} />}
            {alertMessage &&
                <Alert className="max-w-md" variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>{alertMessage}</AlertTitle>
                </Alert>
            }
            <Tabs defaultValue="overview" className="min-w-64">
                <TabsList>
                    <TabsTrigger value="overview">Players {`[${playersInRoom}/${maxPlayersInRoom}]`}</TabsTrigger>
                    {isHost && <TabsTrigger value="room-settings">Room Settings</TabsTrigger>}
                    <TabsTrigger value="player-name-change">Change Name</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    {isLoading
                        ?
                        <Card className="w-full">
                            <CardContent>
                                <Skeleton className="aspect-video w-full" />
                            </CardContent>
                        </Card>
                        : <PlayerList players={players} isHost={isHost} roomCode={roomCode} />
                    }
                </TabsContent>
                <TabsContent value="room-settings">
                    <RoomSettings maxPlayersInRoom={maxPlayersInRoom} roomCode={roomCode} roles={roles} totalRoles={totalRoles} />
                </TabsContent>
                <TabsContent value="player-name-change">
                    <PlayerNameChange roomCode={roomCode} players={players} />
                </TabsContent>
            </Tabs>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                <Button variant="outline" onClick={handleStartGame} disabled={isPending || !isHost || isStarting}>
                    {isPending || isStarting ? <Spinner /> : "Start Game"}
                </Button>
            </div>
        </>
    );
}