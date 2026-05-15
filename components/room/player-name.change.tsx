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
    const [state, formAction, isPending] = useActionState(updatePlayerNameWithRoomKey, null)

    const userId = useUserCookies();
    const player = players.filter(player => player.id === userId)[0];
    const [username, setUsername] = useState(player.name)

    useEffect(() => {
        const handleToast = () => {
            if (state?.success) {
                mutate(roomCode)
                toast(state.message, {position: "top-center", duration: 3000})
            }
        }
        handleToast();
    }, [state, roomCode])

    return (
        <form action={formAction}>
            <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
                    Update Node Name
                </Label>
                <div className="flex w-full justify-between gap-4">
                    <Input
                        className="bg-black border-zinc-800 text-white font-mono focus:border-cyan transition-colors"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button type="submit" variant="outline" disabled={isPending} className="border-zinc-800 hover:border-cyan hover:text-cyan transition-all">
                        {isPending ? "..." : "Update"}
                    </Button>
                </div>
            </div>
        </form>
    );
}