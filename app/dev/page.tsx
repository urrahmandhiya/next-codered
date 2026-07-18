"use client"

import { Terminal, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { goToWaitingRoom } from "@/lib/actions/mock";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen bg-[#050B14] text-zinc-100 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center w-full p-6 border-b border-[#1e293b]/30 bg-[#0A101D]">
                <Link
                    href="/"
                    className="flex items-center justify-center px-4 py-2 bg-[#0A050B]/80 backdrop-blur-md border border-red-900/60 text-red-500 hover:bg-red-950/40 hover:text-red-400 hover:border-red-700 rounded-full transition-all uppercase tracking-widest text-[10px] font-semibold shadow-[0_0_10px_rgba(220,38,38,0.1)] cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Back
                </Link>
                <h1 className="text-xl font-bold tracking-widest text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] pr-14">
                    CODERED
                </h1>
                <div className="w-5 h-5 hidden" />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-16 w-full max-w-md mx-auto relative z-10">
                <h2 className="text-cyan-400 text-[0.7rem] tracking-[0.15em] mb-6 font-mono font-medium text-center">
                    SHORTCUT TO A STATE/ROOM WITH DUMMIES
                </h2>

                <div className="flex flex-col w-full gap-4 justify-center items-center">
                    <Button
                        onClick={() => goToWaitingRoom()}
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-green-900/60 text-green-500 hover:bg-green-950/40 hover:text-green-400 hover:border-green-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_15px_rgba(220,38,38,0.15)]"
                    >
                        Go to Waiting Room
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Link
                        href="/dev/ui/cycle"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-cyan-900/60 text-cyan-500 hover:bg-cyan-950/40 hover:text-cyan-400 hover:border-cyan-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer text-center"
                    >
                        Full Game Cycle Loop
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                        href="/dev/ui/downtime"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-rose-900/60 text-rose-500 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_15px_rgba(255,42,85,0.15)] cursor-pointer text-center"
                    >
                        Downtime Good Side UI
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                        href="/dev/ui/downtime-bad"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-rose-900/60 text-rose-500 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_15px_rgba(255,42,85,0.15)] cursor-pointer text-center"
                    >
                        Downtime Bad Side UI
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                        href="/dev/ui/uptime"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-cyan-900/40 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 hover:border-cyan-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold cursor-pointer text-center"
                    >
                        Uptime UI Preview
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                        href="/dev/ui/hearing"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-cyan-900/40 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 hover:border-cyan-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold cursor-pointer text-center"
                    >
                        Hearing UI Preview
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                        href="/dev/ui/kill-vote"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-rose-900/40 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 hover:border-rose-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold cursor-pointer text-center"
                    >
                        Kill Vote UI Preview
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                        href="/dev/ui/incident-report"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-cyan-900/40 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 hover:border-cyan-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold cursor-pointer text-center"
                    >
                        Incident Report UI
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                        href="/dev/ui/end-screen"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-zinc-700/60 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 hover:border-zinc-500 rounded-full transition-all uppercase tracking-widest text-xs font-semibold cursor-pointer text-center"
                    >
                        End Game UI Preview
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
