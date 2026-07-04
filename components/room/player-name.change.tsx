import { Player } from "@/lib/definitions";
import { Button } from "../ui/button";
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
    const player = players.find((p) => p.id === userId);
    const [username, setUsername] = useState(player?.name || "");

    useEffect(() => {
        if (state?.success) {
            mutate(roomCode)
            toast(state.message, { position: "top-center", duration: 3000 })
        }
    }, [state, roomCode])

    if (!player) return null;

    return (
        <form action={formAction} className="w-full">
            <div className="flex flex-col gap-4 w-full items-center">
                <Label htmlFor="username" className="text-sm font-mono tracking-widest text-cyan uppercase text-glow-cyan text-center">
                    Your Identity (Node Name)
                </Label>
                <div className="flex w-full items-center gap-4">
                    <Input
                        className="flex-1 h-14 bg-black/50 border-2 border-zinc-800 focus-visible:border-cyan focus-visible:ring-cyan/30 text-white font-mono text-lg md:text-xl text-center rounded-xl transition-all"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button type="submit" variant="outline" disabled={isPending} className="h-14 px-6 md:px-8 rounded-xl border-2 border-cyan/50 text-cyan hover:border-cyan hover:text-black hover:bg-cyan hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all uppercase tracking-widest font-mono font-bold">
                        {isPending ? "..." : "SAVE"}
                    </Button>
                </div>
            </div>
        </form>
    );
}