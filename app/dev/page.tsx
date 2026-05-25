"use client"

import { Terminal, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { goToWaitingRoom } from "@/lib/actions/mock";

export default function ContributorPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#050B14] text-zinc-100 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center w-full p-6 border-b border-[#1e293b]/30 bg-[#0A101D]">
                <Terminal className="w-5 h-5 text-zinc-100" />
                <h1 className="text-xl font-bold tracking-widest text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
                    CODERED
                </h1>
                <div className="w-5 h-5" />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-28 w-full max-w-md mx-auto relative z-10">
                <h2 className="text-cyan-400 text-[0.7rem] tracking-[0.15em] mb-6 font-mono font-medium text-center">
                    SHORTCUT TO A STATE/ROOM WITH DUMMIES
                </h2>

                <div className="flex flex-col w-full gap-4 justify-center items-center">
                    <Button
                        onClick={() => goToWaitingRoom()}
                        className="flex items-center justify-center w-full max-w-[16rem] h-14 bg-[#0A050B]/80 backdrop-blur-md border border-green-900/60 text-green-500 hover:bg-green-950/40 hover:text-green-400 hover:border-green-700 rounded-full transition-all uppercase tracking-widest text-xs font-semibold shadow-[0_0_15px_rgba(220,38,38,0.15)]"
                    >
                        Go to Waiting Room
                        <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                </div>
            </main>

            {/* Footer / Back Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-[#050B14] via-[#050B14]/90 to-transparent flex justify-center z-20 pb-8">
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
