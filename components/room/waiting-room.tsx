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

export default function WaitingRoom({
    currentPlayers,
    maxPlayers,
    players,
    isLoading,
    isValidating,
    roomCode }: {
        currentPlayers: number,
        maxPlayers: number,
        players: Player[],
        isLoading: boolean,
        isValidating: boolean,
        roomCode: string,
    }) {
    const [isPending, startTransition] = useTransition();
    const [isStarting, setIsStarting] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    if (alertMessage !== "" && isValidating) setAlertMessage("");
    
    const handleStartGame = () => {
        startTransition(async () => {
            const result = await startGame(roomCode);
            if (result.error) {
                setAlertMessage(result.error)
            } else {
                setIsStarting(true)
            }
        })
    }

    
    return (
        <>
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
                    {isLoading || isValidating
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
                {isStarting 
                ?
                "Please Wait..."
                :
                <Button variant="outline" onClick={handleStartGame} disabled={isPending}>
                    {isPending ? <Spinner /> : "Start Game"}
                </Button>
                }
            </div>
        </>
    );
}