"use client"

import { createRoom } from "@/lib/actions";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useActionState } from "react";
import { Spinner } from "../ui/spinner";

const HOME_DESCRIPTION = `
  Removing physical boundaries. 
  By using your smartphone as the primary terminal, 
  gameplay is flexible and modern.
  The system acts as an automated Game Master, 
  allowing everyone to play without needing a dedicated judge.
`

export default function RoomActions({ onJoinRoom }: { onJoinRoom: () => void }) {
    const [state, formAction, isPending] = useActionState(createRoom, { success: null, error: null })
    return (
        <main>
            <Card>
                <CardContent className="text-xs text-center">
                    {HOME_DESCRIPTION}
                </CardContent>
            </Card>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                <form action={formAction}>
                    <Button className="flex items-center justify-center w-full" variant="outline" type="submit" disabled={isPending}>
                        {isPending ? <Spinner /> : "Create Room"}
                    </Button>
                </form>
                <Button variant="outline" onClick={onJoinRoom}>Join Room</Button>
            </div>
        </main>
    );
}