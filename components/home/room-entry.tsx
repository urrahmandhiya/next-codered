"use client"

import { useState } from "react"
import JoinFormRoom from "./join-room-form";
import RoomActions from "./room-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CyberButton } from "./cyber-button";
import UsernameInput from "./username-input";

export default function RoomEntry() {
    const [isJoining, setIsJoining] = useState(false);
    const [open, setOpen] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setTimeout(() => setIsJoining(false), 300);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<CyberButton>MULAI GAME</CyberButton>} />
            <DialogContent className="sm:max-w-md border border-[#4b6b9e]/50 bg-[#0a0f1c]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-zinc-100 overflow-hidden">
                {/* Cyber corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#4b6b9e]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#4b6b9e]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#4b6b9e]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#4b6b9e]" />
                
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold tracking-widest text-[#6484b9] uppercase border-b border-[#1e293b] pb-4 text-center">
                        {isJoining ? "JOIN ACTIVE ROOM" : "INITIALIZE GAME"}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="py-2 flex flex-col gap-8 relative z-10">
                    <div className="bg-black/40 p-5 rounded-lg border border-[#1e293b]/50">
                        <h3 className="text-xs font-bold mb-3 text-[#4b6b9e] uppercase tracking-[0.2em]">
                            Agent Identity
                        </h3>
                        <UsernameInput />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        {isJoining
                            ? <JoinFormRoom onBack={() => setIsJoining(false)} />
                            : <RoomActions onJoinRoom={() => setIsJoining(true)} />
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}