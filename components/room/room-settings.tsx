import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from "../ui/item";
import { PlusIcon } from "lucide-react";

export default function RoomSettings() {
    const [playerCapacity, SetPlayerCapacity] = useState(8);

    return (
        <Card>
            <CardContent className="text-sm text-muted-foreground flex flex-col gap-4">
                <div className="mx-auto grid w-full max-w-xs gap-3">
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="player-cap">Player capacity: {playerCapacity}</Label>
                    </div>
                    <Slider
                        id="player-cap"
                        value={playerCapacity}
                        onValueChange={(num) => SetPlayerCapacity(num as number)}
                        min={4}
                        max={12}
                        step={1}
                    />
                    {/* <div className="flex items-center justify-between gap-2">
                        <ItemGroup>
                            <Label htmlFor="role-config">Role configuration</Label>
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle>
                                        GOOD
                                    </ItemTitle>
                                </ItemContent>
                                <ItemActions>
                                    <Button variant="ghost">
                                        <PlusIcon />
                                    </Button>
                                </ItemActions>
                                [NUM]
                            </Item>
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle>
                                        BAD
                                    </ItemTitle>
                                </ItemContent>
                                <ItemActions>
                                    <Button variant="ghost">
                                        <PlusIcon />
                                    </Button>
                                </ItemActions>
                                [NUM]
                            </Item>
                        </ItemGroup>
                    </div> */}
                </div>
                <Button>Commit config</Button>
            </CardContent>
        </Card>
    );
}