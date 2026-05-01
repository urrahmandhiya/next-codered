import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { ItemGroup, Item, ItemContent, ItemTitle, ItemActions } from "../ui/item";
import { Player } from "@/lib/definitions";
import { ScrollArea } from "../ui/scroll-area";
import { useUserCookies } from "./cookie-provider";
import { Button } from "../ui/button";
import { XIcon } from "lucide-react";
import { useTransition } from "react";
import { deletePlayer } from "@/lib/actions";
import { toast } from "sonner";
import { mutate } from "swr";

export default function PlayerList({ players, isHost, roomCode }: { players: Player[], isHost: boolean, roomCode: string }) {
    const [isPending, startTransition] = useTransition()
    const descendingPlayers = [...(players ?? [])].sort((a, b) => a.createdAt - b.createdAt);
    const userId = useUserCookies();

    const handleDeletePlayer = (roomCode: string, playerId: string) => {
        startTransition(async () => {
            const result = await deletePlayer(roomCode, playerId)
            if (result.error) {
                toast.error(result.error, { position: "top-center", duration: 3000 })
            } else {
                toast.success(result.success, { position: "top-center", duration: 3000 })
                mutate(roomCode);
            }
        })
    }

    return (
        <Card>
            <CardContent className="text-sm text-muted-foreground">
                <ScrollArea className="h-48 w-full">
                    <ItemGroup>
                        {descendingPlayers.map((player) => (
                            <Item key={player.id} variant="outline">
                                <ItemContent>
                                    <ItemTitle className="flex justify-between w-full">
                                        {player.name}
                                        <div className="flex gap-2 items-center">
                                            {player.isHost && <Badge variant="outline">Host</Badge>}
                                            {(isHost && player.id !== userId) &&
                                                <ItemActions>
                                                    <Button
                                                        disabled={isPending}
                                                        variant="destructive"
                                                        size="xs"
                                                        onClick={() => {
                                                            handleDeletePlayer(roomCode, player.id)
                                                        }}
                                                    >
                                                        <XIcon />
                                                    </Button>
                                                </ItemActions>
                                            }
                                        </div>
                                    </ItemTitle>
                                    {player.id === userId && <span className="text-xs">You</span>}
                                </ItemContent>
                            </Item>
                        ))}
                    </ItemGroup>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}