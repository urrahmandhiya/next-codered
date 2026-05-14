"use client"

import { Button } from "@/components/ui/button";
import PlayerList from "./player-list";
import { Skeleton } from "../ui/skeleton";
import { startGame } from "@/lib/actions/room";
import RoomSettings from "./room-settings";
import { useState, useTransition } from "react";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";
import { AlertCircleIcon, Copy, Settings, Check } from "lucide-react";
import { Player } from "@/lib/definitions";
import UpdateButton from "./update-button";
import { updateRoomState } from "@/lib/data";
import useSWR from "swr";
import { useUserCookies } from "./cookie-provider";
import PlayerNameChange from "./player-name.change";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "../ui/separator";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

export default function WaitingRoom({ roomCode }: { roomCode: string }) {
    const [isPending, startTransition] = useTransition();
    const [alertMessage, setAlertMessage] = useState("");
    const [isStarting, setIsStarting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data, isLoading, mutate } = useSWR(roomCode, updateRoomState, {
        refreshInterval: isDev ? 0 : 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });

    const userId = useUserCookies();

    const playersInRoom = data?.playersInRoom || 0;
    const maxPlayersInRoom = data?.maxPlayersInRoom || 12;
    const players = (data?.players as Player[]) || [];
    const isHost = data?.roomHostId === userId;
    const roles = data?.roles || [];
    const totalRoles = data?.roles.reduce((acc, curr) => acc += Number(curr.amount), 0) || 0;

    const handleStartGame = () => {
        startTransition(async () => {
            const result = await startGame(roomCode);
            if (result?.success === false) {
                setAlertMessage(result.error)
            } else {
                setIsStarting(true);
            }
        })
    }

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        toast.success("Room code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center gap-8 w-full max-w-md">
                <Skeleton className="h-8 w-64 bg-zinc-900" />
                <Skeleton className="h-32 w-full rounded-3xl bg-zinc-900" />
                <div className="w-full space-y-4">
                    <Skeleton className="h-6 w-32 bg-zinc-900" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full rounded-full bg-zinc-900" />
                        <Skeleton className="h-12 w-full rounded-full bg-zinc-900" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-2xl px-4 py-6 overflow-hidden">
            
            {/* Top Section */}
            <div className="flex flex-col items-center gap-8 w-full">
                {/* Header */}
                <div className="text-center space-y-1">
                    <h2 className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-cyan uppercase opacity-80 text-glow-cyan">
                        Secure Connection Established
                    </h2>
                </div>

                {/* Room Code Card */}
                <button 
                    onClick={copyCode}
                    className="group relative flex flex-col items-center justify-center gap-3 px-12 py-6 rounded-[2.5rem] bg-black border-2 border-cyan/40 border-glow-cyan hover:border-cyan/60 transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider text-glow-cyan">
                            {roomCode}
                        </span>
                        <div className="p-2 rounded-lg bg-cyan/10 text-cyan">
                            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
                        </div>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase group-hover:text-cyan/70 transition-colors">
                        Tap to copy access code
                    </span>
                </button>
            </div>

            {/* Middle Section (Players) */}
            <div className="w-full flex-1 flex flex-col justify-start max-h-[50vh] py-2">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-mono font-bold tracking-[0.2em] text-white uppercase">
                            Connected Nodes
                        </h3>
                        <span className="text-sm font-mono text-cyan/80">
                            {playersInRoom}/{maxPlayersInRoom}
                        </span>
                    </div>
                    <Separator className="bg-zinc-800/50" />
                    
                    {alertMessage &&
                        <Alert className="bg-destructive/10 border-destructive/20 text-destructive mb-4" variant="destructive">
                            <AlertCircleIcon className="size-4" />
                            <AlertTitle>{alertMessage}</AlertTitle>
                        </Alert>
                    }

                    <div className="py-2">
                        <PlayerList players={players} isHost={isHost} roomCode={roomCode} maxPlayers={maxPlayersInRoom} />
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col items-center gap-6 w-full pt-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button 
                        onClick={handleStartGame} 
                        disabled={isPending || !isHost || isStarting}
                        className="flex-1 sm:flex-none h-16 px-12 rounded-full bg-cyan text-black font-bold text-lg hover:bg-cyan/90 border-glow-cyan disabled:opacity-50 disabled:bg-cyan/30 transition-all shadow-[0_0_20px_var(--color-cyan-glow)]"
                    >
                        {isPending || isStarting ? <Spinner className="text-black" /> : "START GAME"}
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSettings(true)}
                        className="size-16 rounded-full border-2 border-zinc-800 bg-black text-zinc-400 hover:text-cyan hover:border-cyan/50 hover:border-glow-cyan transition-all"
                    >
                        <Settings className="size-7" />
                    </Button>
                </div>
            </div>

            {/* Settings Overlay/Modal Logic */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Room Settings</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                                <Check className="size-5" />
                            </Button>
                        </div>
                        <div className="space-y-8">
                            <PlayerNameChange roomCode={roomCode} players={players} />
                            {isHost && (
                                <RoomSettings 
                                    maxPlayersInRoom={maxPlayersInRoom} 
                                    roomCode={roomCode} 
                                    roles={roles} 
                                    totalRoles={totalRoles} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}