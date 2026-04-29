"use client"

import { Card, CardContent } from "../ui/card";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { updateRoomSettings } from "@/lib/actions";
import { useActionState, useEffect } from "react";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
    playerCapacity: z
        .number()
        .min(4, "Player minimum 4")
        .max(12, "Player maximum 12"),
})

export default function RoomSettings({ roomCode }: { roomCode: string }) {
    const updateRoomSettingsWithRoomCode = updateRoomSettings.bind(null, roomCode);
    const [state, formAction, isPending] = useActionState(updateRoomSettingsWithRoomCode, { message: null, error: null });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            playerCapacity: 8,
        },
    })

    useEffect(() => {
        const handleToast = () => {
            toast(state.message, { duration: 3000, position: "top-center" })
        }
        handleToast();
    }, [state])

    return (
        <Card>
            <CardContent className="text-sm text-muted-foreground flex flex-col gap-4">
                <form id="room-settings" action={formAction} className="flex flex-col gap-4">
                    <FieldGroup className="mx-auto grid w-full max-w-xs gap-3">
                        <Controller
                            name="playerCapacity"
                            control={form.control}
                            render={({ field: { value, onChange } }) => (
                                <Field>
                                    <FieldLabel
                                        className="flex items-center justify-between gap-2"
                                        htmlFor="room-settings-player-cap"
                                    >
                                        Player capacity: {value}
                                    </FieldLabel>
                                    <Slider
                                        name="player-cap"
                                        id="room-settings-player-cap"
                                        value={[value]}
                                        onValueChange={onChange}
                                        min={4}
                                        max={12}
                                        step={1}
                                    />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <Button variant="outline" disabled={isPending} type="submit">
                        {isPending ? <Spinner /> : "Commit Config"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}