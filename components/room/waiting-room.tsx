import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import RoomSettings from "./room-settings";
import PlayerList from "./player-list";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Player } from "@/app/actions";

export default function WaitingRoom({currentPlayers, players, isLoading}: {currentPlayers: number, players: Player[], isLoading: boolean}) {
    const MAX_NUMBER_OF_PLAYERS = 4;
    return (
        <>
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
        </>
    );
}