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
import { startGame } from "@/lib/actions";
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

    const userCookie = useUserCookies();

    const currentPlayers = data?.currentPlayer || 0;
    const maxPlayers = data?.maxPlayer || 0;
    const players = data?.players as Player[];
    const isHost = data?.hostId === userCookie;

    const handleStartGame = () => {
        startTransition(async () => {
            const result = await startGame(roomCode);
            if (result.error) {
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
                    <TabsTrigger value="overview">Players {`[${currentPlayers}/${maxPlayers}]`}</TabsTrigger>
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
                <Button variant="outline" onClick={handleStartGame} disabled={isPending || !isHost || isStarting}>
                    {isPending || isStarting ? <Spinner /> : "Start Game"}
                </Button>
            </div>
        </>
    );
}