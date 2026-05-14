import { Player } from "@/lib/definitions";
import { useUserCookies } from "./cookie-provider";
import { cn } from "@/lib/utils";
import { Hourglass } from "lucide-react";

export default function PlayerList({
    players,
    isHost,
    roomCode,
    maxPlayers = 12
}: {
    players: Player[],
    isHost: boolean,
    roomCode: string,
    maxPlayers?: number
}) {
    const descendingPlayers = [...(players ?? [])].sort((a, b) => a.createdAt - b.createdAt);
    const userId = useUserCookies();

    return (
        <div className="flex flex-wrap gap-4 justify-center w-full">
            {descendingPlayers.map((player) => (
                <div
                    key={player.id}
                    className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-full border border-cyan/30 bg-cyan/5 border-glow-cyan transition-all",
                        player.id === userId && "border-cyan/60 bg-cyan/10 ring-1 ring-cyan/20"
                    )}
                >
                    <div className="size-2 rounded-full bg-cyan shadow-[0_0_8px_var(--color-cyan)]" />
                    <span className="text-sm font-medium text-cyan/90 tracking-wide">
                        {player.name}
                        {player.id === userId && <span className="ml-1 opacity-70">(You)</span>}
                    </span>
                </div>
            ))}
        </div>
    );
}
