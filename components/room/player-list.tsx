import { Player } from "@/lib/definitions";
import { useUserCookies } from "./cookie-provider";
import { cn } from "@/lib/utils";
import { Hourglass, XCircle } from "lucide-react";
import { deletePlayer } from "@/lib/actions/room";
import { useTransition } from "react";
import { toast } from "sonner";

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
    const [isPending, startTransition] = useTransition();

    const handleKick = (playerId: string) => {
        startTransition(async () => {
            const result = await deletePlayer(roomCode, playerId);
            if (result?.success) {
                toast.success(result.message);
            } else {
                toast.error(result?.error || "Failed to kick player");
            }
        });
    };

    return (
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full">
            {descendingPlayers.map((player) => {
                const isStale = Date.now() - (player.lastSeen || player.createdAt) > 3500;

                return (
                    <div
                        key={player.id}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full border transition-all",
                            player.id === userId
                                ? "border-cyan/60 bg-cyan/10 ring-1 ring-cyan/20"
                                : isStale
                                ? "border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                                : "border-cyan/30 bg-cyan/5 border-glow-cyan"
                        )}
                    >
                        <div className={cn(
                            "size-2 md:size-3 rounded-full shadow-[0_0_8px_currentColor]",
                            isStale ? "bg-yellow-500 text-yellow-500" : "bg-cyan text-cyan"
                        )} />
                        <span className={cn(
                            "text-sm md:text-base font-medium tracking-wide flex items-center",
                            isStale ? "text-yellow-500/90" : "text-cyan/90"
                        )}>
                            {player.name}
                            {player.id === userId && <span className="ml-1 opacity-70">(You)</span>}
                            {player.isHost && (
                                <span className="ml-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 px-2 py-0.5 rounded-md">
                                    Host
                                </span>
                            )}
                        </span>

                        {isHost && player.id !== userId && (
                            <button
                                onClick={() => handleKick(player.id)}
                                disabled={isPending}
                                className="ml-2 text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Kick player"
                            >
                                <XCircle className="size-5" />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
