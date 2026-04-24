"use client"

import { joinRoom } from "@/lib/actions";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useActionState } from "react";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function JoinRoomForm({ onBack }: { onBack: () => void }) {
    const [state, formAction, isPending] = useActionState(joinRoom, { message: null, error: null })
    if (state.message) console.log(state.message);
    return (
        <>
            <Card>
                <CardContent className="text-xs text-center flex flex-col gap-6">
                    {state.error !== null &&
                        <Alert className="max-w-md" variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>{state.message}</AlertTitle>
                        </Alert>
                    }
                    <form action={formAction}>
                        <Field>
                            <FieldLabel htmlFor="room-input">
                                Room Code
                            </FieldLabel>
                            <Input
                                className="text-xs"
                                id="room-input"
                                name="room"
                                type="text"
                                placeholder="Enter Room Code"
                            />
                            <Button variant="outline" type="submit" disabled={isPending}>
                                {isPending ? <Spinner /> : "Submit"}
                            </Button>
                        </Field>
                    </form>
                </CardContent>
            </Card>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                <Button variant="outline" onClick={onBack}>Back</Button>
            </div>
        </>
    );
}