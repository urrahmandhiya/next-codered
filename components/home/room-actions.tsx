"use client"

import { createRoom } from "@/lib/actions";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { startTransition, useActionState } from "react";
import { Spinner } from "../ui/spinner";

const HOME_DESCRIPTION = `
  Removing physical boundaries. 
  By using your smartphone as the primary terminal, 
  gameplay is flexible and modern.
  The system acts as an automated Game Master, 
  allowing everyone to play without needing a dedicated judge.
`

export default function RoomActions({ onJoinRoom }: { onJoinRoom: () => void }) {
    const [state, formAction, isPending] = useActionState(createRoom, { message: null, error: null })
    if (state.error || state.message) console.log(state);
    return (
        <>
            <Card>
                <CardContent className="text-xs text-center">
                    {HOME_DESCRIPTION}
                </CardContent>
            </Card>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                <Button onClick={() => startTransition(() => formAction())} variant="outline" type="submit" disabled={isPending}>
                    {isPending ? <Spinner /> : "Create Room"}
                </Button>
                <Button variant="outline" onClick={onJoinRoom}>Join Room</Button>
            </div>
        </>
    );
}