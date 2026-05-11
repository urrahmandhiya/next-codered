"use client"

import { Card, CardContent } from "../ui/card";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { updateRoomSettings } from "@/lib/actions/room";
import { useActionState, useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { mutate } from "swr";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "../ui/item";
import { AlertCircleIcon, MinusIcon, PlusIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Alert, AlertTitle } from "../ui/alert";
import { Role } from "@/lib/definitions";
import clsx from "clsx";

export default function RoomSettings({
    maxPlayersInRoom, roomCode, roles, totalRoles }: {
        maxPlayersInRoom: number,
        roomCode: string,
        roles: Role[],
        totalRoles: number
    }) {
    const [players, setPlayers] = useState(maxPlayersInRoom);
    const [rolesSetting, setRolesSettting] = useState(roles);
    const [totalRolesSetting, setTtotalRolesSetting] = useState(totalRoles);

    const updateRoomSettingsWithRoomCode = updateRoomSettings.bind(null, roomCode);
    const [state, formAction, isPending] = useActionState(updateRoomSettingsWithRoomCode, null);

    const handleTotalAmount = (btn: "increment" | "decrement", amount: number) => {
        if (btn === "increment") {
            if (totalRolesSetting < players) {
                setTtotalRolesSetting(totalRolesSetting + 1);
                return amount + 1;
            }
            return amount;
        }
        if (btn === "decrement") {
            if (amount > 1) {
                setTtotalRolesSetting(totalRolesSetting - 1);
                return amount - 1;
            }
            return amount;
        }
        return amount;
    }

    const handleRoleAmount = (index: number, btn: "increment" | "decrement") => {
        setRolesSettting((prev) => (
            prev.map((val, n) => index === n
                ? { ...val, amount: handleTotalAmount(btn, val.amount) }
                : val
            )
        ));
    };

    useEffect(() => {
        const handleToast = () => {
            if (state?.success === true) {
                mutate(roomCode)
                toast(state.message, { duration: 3000, position: "top-center" });
            }
        }
        handleToast();
    }, [state, roomCode])
    return (
        <Card>
            <CardContent className="text-sm text-muted-foreground flex flex-col gap-4">
                <form id="room-settings" action={formAction} className="flex flex-col gap-4">
                    <ScrollArea className="h-48 w-full">

                        <FieldGroup className="mx-auto grid w-full max-w-xs gap-3">
                            <Field>
                                <FieldLabel
                                    className="flex items-center justify-between gap-2"
                                    htmlFor="room-settings-player-cap"
                                >
                                    Player capacity: {players}
                                </FieldLabel>
                                <Slider
                                    name="player-cap"
                                    id="room-settings-player-cap"
                                    value={players}
                                    onValueChange={(val) => setPlayers(val as number)}
                                    min={4}
                                    max={12}
                                    step={1}
                                />
                            </Field>
                            <Field>
                                <FieldLabel
                                    className="flex items-center justify-between gap-2"
                                    htmlFor="room-settings-player-cap"
                                >
                                    Role distribution
                                </FieldLabel>
                                <ItemGroup>
                                    {rolesSetting.map((role, idx) => (
                                        <Item key={role.name} variant="outline" className={clsx({ "border-red-500": totalRolesSetting !== players })}>
                                            <ItemContent>
                                                <ItemTitle>
                                                    {role.name}
                                                </ItemTitle>
                                                <ItemDescription>
                                                    {role.amount}
                                                </ItemDescription>
                                            </ItemContent>
                                            <ItemActions>
                                                <Button
                                                    onClick={() => handleRoleAmount(idx, "decrement")}
                                                    variant="outline"
                                                >
                                                    <MinusIcon />
                                                </Button>
                                                <Button
                                                    onClick={() => handleRoleAmount(idx, "increment")}
                                                    variant="outline"
                                                >
                                                    <PlusIcon />
                                                </Button>
                                            </ItemActions>
                                            <input name={`${role.name}-amount`} type="hidden" value={role.amount} />
                                        </Item>
                                    ))}
                                </ItemGroup>
                            </Field>
                        </FieldGroup>
                    </ScrollArea>
                    {totalRolesSetting !== players &&
                        <Alert className="max-w-md" variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>Player capacity and total role distribution amount mismatched</AlertTitle>
                        </Alert>
                    }
                    <Button variant="outline" disabled={isPending || (totalRolesSetting !== players)} type="submit">
                        {isPending ? <Spinner /> : "Commit Config"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}