import { Player } from "@/lib/definitions";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useUserCookies } from "./cookie-provider";
import { useActionState, useEffect, useState } from "react";
import { updatePlayerName } from "@/lib/actions/room";
import { toast } from "sonner";
import { mutate } from "swr";

export default function PlayerNameChange({ roomCode, players }: { roomCode: string, players: Player[] }) {
    const updatePlayerNameWithRoomKey = updatePlayerName.bind(null, roomCode)
    const [state, formAction, isPending] = useActionState(updatePlayerNameWithRoomKey, { message: null, error: null })

    const userId = useUserCookies();
    const player = players.filter(player => player.id === userId)[0];
    const [username, setUsername] = useState(player.name)

    useEffect(() => {
        const handleToast = () => {
            if (state.message) {
                mutate(roomCode)
                toast(state.message, {position: "top-center", duration: 3000})
            }
        }
        handleToast();
    }, [state, roomCode])

    return (
        <Card>
            <CardContent>
                <form action={formAction}>
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
                        <Button type="submit" variant="outline" disabled={isPending}>Confirm</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}