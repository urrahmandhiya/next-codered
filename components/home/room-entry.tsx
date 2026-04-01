"use client"

import { useState } from "react"
import JoinFormRoom from "./join-room-form";
import RoomActions from "./room-actions";

export default function RoomEntry() {
    const [isJoining, setIsJoining] = useState(false);

    return (
        isJoining
            ? <JoinFormRoom onBack={() => setIsJoining(false)} />
            : <RoomActions onJoinRoom={() => setIsJoining(true)} />
    );
}