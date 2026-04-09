import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { ItemGroup, Item, ItemContent, ItemTitle } from "../ui/item";
import { Player } from "@/app/actions";

export default function PlayerList({players}: {players: Player[]}) {
    return(
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
    );
}