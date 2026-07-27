"use client"

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { goToWaitingRoom } from "@/lib/actions/mock";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen bg-[#050B14] text-zinc-100 font-sans relative">
            {/* Desktop Top-Left Back Button */}
            <Link
                href="/"
                className="fixed top-6 left-6 hidden md:flex items-center justify-center px-4 py-2 bg-[#0A050B]/80 backdrop-blur-md border border-red-900/60 text-red-500 hover:bg-red-950/40 hover:text-red-400 hover:border-red-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_10px_rgba(220,38,38,0.15)] cursor-pointer z-30"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Link>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-28 md:pb-16 w-full max-w-md mx-auto relative z-10">
                <h2 className="text-cyan-400 text-[0.7rem] tracking-[0.15em] mb-6 font-mono font-medium text-center">
                    SHORTCUT TO A STATE/ROOM WITH DUMMIES
                </h2>

                <div className="flex flex-col w-full gap-4 justify-center items-center">
                    <Link
                        href="/dev/ratelimit"
                        className="flex items-center justify-center w-full max-w-[18rem] h-12 bg-[#0A050B]/80 backdrop-blur-md border border-rose-900/60 text-rose-500 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_15px_rgba(255,42,85,0.15)] cursor-pointer text-center"
                    >
                        Check Ratelimit
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
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

            {/* Mobile Sticky Bottom Bar Back Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-[#050B14] via-[#050B14]/90 to-transparent flex justify-center z-20 pb-8 md:hidden">
                <Link
                    href="/"
                    className="flex items-center justify-center w-full max-w-[16rem] h-14 bg-[#0A050B]/80 backdrop-blur-md border border-red-900/60 text-red-500 hover:bg-red-950/40 hover:text-red-400 hover:border-red-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_15px_rgba(220,38,38,0.15)]"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
