"use client"

import { joinRoom } from "@/lib/actions/home";
import { Button } from "../ui/button";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useActionState } from "react";
import { Spinner } from "../ui/spinner";
import { Alert, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function JoinRoomForm({ username, onBack }: { username: string, onBack: () => void }) {
    const [state, formAction, isPending] = useActionState(joinRoom, null)

    return (
        <div className="flex flex-col gap-6">
            {(state?.success === false) && (
                <Alert className="bg-red-950/50 border-red-900 text-red-200" variant="destructive">
                    <AlertCircleIcon className="w-4 h-4 text-red-400" />
                    <AlertTitle className="text-xs uppercase tracking-widest">
                        {state.error}
                    </AlertTitle>
                </Alert>
            )}
            <form action={formAction} className="flex flex-col gap-4">
                <input type="hidden" name="username" value={username} />
                <Field>
                    <FieldLabel htmlFor="room-input" className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
                        Room Code
                    </FieldLabel>
                    <Input
                        className="h-12 bg-black/50 border-[#1e293b] text-white focus-visible:ring-[#4b6b9e] text-center tracking-widest uppercase text-lg"
                        id="room-input"
                        name="room"
                        type="text"
                        placeholder="ENTER CODE"
                        autoComplete="off"
                    />
                </Field>
                <div className="flex gap-3 mt-2">
                    <Button variant="outline" type="button" onClick={onBack} className="w-1/3 h-12 bg-[#1e293b]/70 border-[#1e293b] text-zinc-400 hover:text-white hover:bg-[#1e293b]/50">
                        Back
                    </Button>
                    <Button variant="default" type="submit" disabled={isPending} className="w-2/3 h-12 bg-cyan-400 hover:bg-cyan-500 text-white font-bold tracking-widest">
                        {isPending ? <Spinner /> : "CONNECT"}
                    </Button>
                </div>
            </form>
        </div>
    );
}