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

export default function RoomSettings({ maxPlayersInRoom, roomCode }: { maxPlayersInRoom: number, roomCode: string }) {
    const [players, setPlayers] = useState(maxPlayersInRoom);
    const updateRoomSettingsWithRoomCode = updateRoomSettings.bind(null, roomCode);
    const [state, formAction, isPending] = useActionState(updateRoomSettingsWithRoomCode, { message: null, error: null });

    useEffect(() => {
        const handleToast = () => {
            if (state.message) {
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
                    </FieldGroup>
                    <Button variant="outline" disabled={isPending} type="submit">
                        {isPending ? <Spinner /> : "Commit Config"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}