"use client"

import { Button } from "../ui/button";
import { useActionState } from "react";
import { createRoom } from "@/lib/actions/home";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function RoomActions({ username, onJoinRoom }: { username: string, onJoinRoom: () => void }) {
    const [state, formAction, isPending] = useActionState(createRoom, null)

    return (
        <div className="flex flex-col gap-4 w-full">
            {(state?.success === false) && (
                <Alert className="bg-red-950/50 border-red-900 text-red-200" variant="destructive">
                    <AlertCircleIcon className="w-4 h-4 text-red-400" />
                    <AlertTitle className="text-xs uppercase tracking-widest">
                        {state.error}
                    </AlertTitle>
                </Alert>
            )}
            <div className="grid grid-cols-2 gap-4 w-full">
                <form action={formAction} className="w-full">
                    <input type="hidden" name="username" value={username} />
                    <Button variant="default" type="submit" disabled={isPending} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest flex flex-col gap-1 items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        {isPending ? <Spinner /> : (
                            <>
                                <span>Create</span>
                                <span>Room</span>
                            </>
                        )}
                    </Button>
                </form>
                <Button 
                    variant="outline" 
                    onClick={onJoinRoom} 
                    className="w-full h-16 bg-[#111827] border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors flex flex-col gap-1 items-center justify-center font-bold text-xs uppercase tracking-widest"
                >
                    <span>Join</span>
                    <span>Room</span>
                </Button>
            </div>
        </div>
    );
}