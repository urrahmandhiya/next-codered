import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { ItemGroup, Item, ItemContent, ItemTitle } from "../ui/item";
import { Player } from "@/lib/definitions";
import { ScrollArea } from "../ui/scroll-area";

export default function PlayerList({ players }: { players: Player[] }) {
    const descendingPlayers = [...(players ?? [])].sort((a, b) => a.createdAt - b.createdAt);
    return (
        <Card>
            <CardContent className="text-sm text-muted-foreground">
                <ScrollArea className="h-48 w-full">
                    <ItemGroup>
                        {descendingPlayers.map((player) => (
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
                </ScrollArea>
            </CardContent>
        </Card>
    );
}