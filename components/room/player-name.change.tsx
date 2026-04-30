import { Player } from "@/lib/definitions";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useUserCookies } from "./cookie-provider";
import { useState } from "react";

export default function PlayerNameChange({ players }: { players: Player[] }) {
    const userId = useUserCookies();
    const player = players.filter(player => player.id === userId)[0];

    const [username, setUsername] = useState(player.name)

    return (
        <Card>
            <CardContent>
                <div className="flex w-full justify-between gap-4">
                    <Label htmlFor="username" className="sr-only">
                        Username
                    </Label>
                    <Input
                        className="text-xs"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button variant="outline" >Confirm</Button>
                </div>
            </CardContent>
        </Card>
    );
}