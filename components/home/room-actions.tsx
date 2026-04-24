"use client"

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useActionState } from "react";
import { createRoom } from "@/lib/actions";
import { Spinner } from "../ui/spinner";
import UsernameInput from "./username-input";

const HOME_DESCRIPTION = `
  Removing physical boundaries. 
  By using your smartphone as the primary terminal, 
  gameplay is flexible and modern.
  The system acts as an automated Game Master, 
  allowing everyone to play without needing a dedicated judge.
`

export default function RoomActions({ onJoinRoom }: { onJoinRoom: () => void }) {
    const [state, formAction, isPending] = useActionState(createRoom, { message: null, error: null })
    if (state.message) console.log(state.message);

    return (
        <>
            <Card>
                <CardContent className="text-xs text-center">
                    {HOME_DESCRIPTION}
                </CardContent>
            </Card>
            <div className="flex flex-col gap-4 text-base">
                <form action={formAction} className="flex flex-col gap-4">
                    <UsernameInput />
                    <Button variant="outline" type="submit" disabled={isPending}>
                        {isPending ? <Spinner /> : "Create Room"}
                    </Button>
                </form>
                <Button variant="outline" onClick={onJoinRoom}>Join Room</Button>
            </div>
        </>
    );
}