"use client"

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { updateRoomSettings } from "@/lib/actions/room";
import { useActionState, useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { mutate } from "swr";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Role } from "@/lib/definitions";

export default function RoomSettings({
    maxPlayersInRoom, roomCode, roles, totalRoles
}: {
    maxPlayersInRoom: number,
    roomCode: string,
    roles: Role[],
    totalRoles: number
}) {
    const [players, setPlayers] = useState(maxPlayersInRoom);
    const [rolesSetting, setRolesSetting] = useState(roles);

    const updateRoomSettingsWithRoomCode = updateRoomSettings.bind(null, roomCode);
    const [state, formAction, isPending] = useActionState(updateRoomSettingsWithRoomCode, null);

    const handlePlayersChange = (newPlayersVal: number) => {
        const clampedPlayers = Math.max(4, Math.min(25, newPlayersVal));
        setPlayers(clampedPlayers);

        const newMaxWerewolf = Math.floor(clampedPlayers * 0.3);
        const newWerewolf = Math.max(1, newMaxWerewolf);
        const newVillager = clampedPlayers - newWerewolf;

        setRolesSetting((prev) =>
            prev.map((role) => {
                if (role.name === "werewolf") {
                    return { ...role, amount: newWerewolf };
                }
                if (role.name === "villager") {
                    return { ...role, amount: newVillager };
                }
                return role;
            })
        );
    };

    const handleRoleChange = (roleName: string, action: "increment" | "decrement") => {
        const werewolfRole = rolesSetting.find((r) => r.name === "werewolf");
        const villagerRole = rolesSetting.find((r) => r.name === "villager");
        if (!werewolfRole || !villagerRole) return;

        let wAmount = werewolfRole.amount;
        let vAmount = villagerRole.amount;

        const maxWerewolfLimit = Math.floor(players * 0.3);

        if (roleName === "werewolf") {
            if (action === "increment") {
                if (wAmount < maxWerewolfLimit) {
                    wAmount += 1;
                    vAmount -= 1;
                }
            } else {
                if (wAmount > 1) {
                    wAmount -= 1;
                    vAmount += 1;
                }
            }
        } else if (roleName === "villager") {
            if (action === "increment") {
                if (wAmount > 1) {
                    vAmount += 1;
                    wAmount -= 1;
                }
            } else {
                if (wAmount < maxWerewolfLimit && vAmount > 1) {
                    vAmount -= 1;
                    wAmount += 1;
                }
            }
        }

        setRolesSetting((prev) =>
            prev.map((role) => {
                if (role.name === "werewolf") {
                    return { ...role, amount: wAmount };
                }
                if (role.name === "villager") {
                    return { ...role, amount: vAmount };
                }
                return role;
            })
        );
    };

    useEffect(() => {
        if (state?.success === true) {
            mutate(roomCode);
            toast(state.message, { duration: 3000, position: "top-center" });
        }
    }, [state, roomCode]);

        const maxWerewolfLimit = Math.floor(players * 0.3);
        const currentWerewolf = rolesSetting.find(r => r.name === "werewolf")?.amount || 1;

        return (
        <div className="w-full">
            <form id="room-settings" action={formAction} className="flex flex-col gap-8 w-full">
                
                {/* Player Capacity Section */}
                <div className="flex flex-col items-center gap-4 w-full">
                    <label
                        htmlFor="room-settings-player-cap"
                        className="text-sm font-mono tracking-widest text-cyan uppercase text-glow-cyan text-center"
                    >
                        Player Capacity (4 - 25)
                    </label>
                    
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            onClick={() => handlePlayersChange(players - 1)}
                            variant="outline"
                            disabled={players <= 4}
                            className="border-cyan/30 text-cyan bg-cyan/5 hover:bg-cyan/15 hover:border-cyan/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] size-12 rounded-xl transition-all disabled:opacity-50 disabled:hover:shadow-none"
                        >
                            <MinusIcon className="size-5" />
                        </Button>
                        <Input
                            type="number"
                            name="player-cap"
                            id="room-settings-player-cap"
                            value={players}
                            onChange={(e) => handlePlayersChange(Number(e.target.value))}
                            className="w-24 h-12 text-center font-mono text-xl font-bold text-white bg-black/50 border-2 border-cyan/40 focus-visible:border-cyan focus-visible:ring-cyan/30 border-glow-cyan rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={4}
                            max={25}
                        />
                        <Button
                            type="button"
                            onClick={() => handlePlayersChange(players + 1)}
                            variant="outline"
                            disabled={players >= 25}
                            className="border-cyan/30 text-cyan bg-cyan/5 hover:bg-cyan/15 hover:border-cyan/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] size-12 rounded-xl transition-all disabled:opacity-50 disabled:hover:shadow-none"
                        >
                            <PlusIcon className="size-5" />
                        </Button>
                    </div>
                </div>

                {/* Role Distribution Section */}
                <div className="flex flex-col gap-4 w-full">
                    <label className="text-sm font-mono tracking-widest text-cyan uppercase text-center text-glow-cyan">
                        Role Distribution
                    </label>
                    <div className="flex flex-col gap-3">
                        {rolesSetting.map((role) => {
                            let disableMinus = false;
                            let disablePlus = false;

                            if (role.name === "werewolf") {
                                disableMinus = role.amount <= 1;
                                disablePlus = role.amount >= maxWerewolfLimit;
                            } else if (role.name === "villager") {
                                disableMinus = currentWerewolf >= maxWerewolfLimit || role.amount <= 1;
                                disablePlus = currentWerewolf <= 1;
                            }

                            return (
                                <div key={role.name} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/50">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-white capitalize text-base font-bold tracking-wide">{role.name}</span>
                                        {role.name === "werewolf" && (
                                            <span className="text-xs text-zinc-500 font-mono mt-1">Max limit: {maxWerewolfLimit}</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            onClick={() => handleRoleChange(role.name, "decrement")}
                                            variant="outline"
                                            disabled={disableMinus}
                                            className="size-8 md:size-10 rounded-lg border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                                        >
                                            <MinusIcon className="size-4" />
                                        </Button>
                                        <span className="w-8 text-center font-mono font-bold text-lg text-white">
                                            {role.amount}
                                        </span>
                                        <Button
                                            type="button"
                                            onClick={() => handleRoleChange(role.name, "increment")}
                                            variant="outline"
                                            disabled={disablePlus}
                                            className="size-8 md:size-10 rounded-lg border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                                        >
                                            <PlusIcon className="size-4" />
                                        </Button>
                                        <input name={`${role.name}-amount`} type="hidden" value={role.amount} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="sticky bottom-0 z-10 pt-4 pb-2 bg-black/80 backdrop-blur-xl border-t border-zinc-800/50 mt-4 -mx-2 px-2">
                    <Button 
                        variant="outline" 
                        disabled={isPending} 
                        type="submit"
                        className="w-full h-14 rounded-xl border-2 border-cyan text-cyan bg-cyan/5 hover:bg-cyan/10 font-mono font-bold text-lg tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all shadow-lg"
                    >
                        {isPending ? <Spinner className="text-cyan" /> : "COMMIT CONFIG"}
                    </Button>
                </div>
            </form>
        </div>
    );
}