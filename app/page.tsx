import RoomEntry from "@/components/home/room-entry";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HOME_DESCRIPTION = `Removing physical boundaries. By using your smartphone as the primary terminal, gameplay is flexible and modern. The system acts as an automated Game Master, allowing everyone to play without needing a dedicated judge.`;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-cyber-grid font-sans text-zinc-100">
      
      {/* Top Bar */}
      <header className="flex justify-between items-center w-full p-6 text-xs tracking-widest text-[#4b6b9e] uppercase font-mono">
        <div>SYSTEM READY // V2.1.0-BETA</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-400" style={{boxShadow: "0 0 8px rgba(16, 185, 129, 0.8)"}} />
          <span className="text-emerald-500 font-bold">LIVE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 w-full max-w-lg mx-auto flex-col items-center justify-center px-6 pb-20 relative z-10">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="relative">
            <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tighter italic">
              <span className="text-white">CODE</span>
              <span className="text-red-600 text-glow-red">RED</span>
            </h1>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[120%] h-[2px] sm:h-[3px] md:h-[4px] bg-linear-to-r from-transparent via-red-600 to-transparent opacity-90 border-glow-red" />
          </div>
          <h2 className="text-[#6484b9] text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-center max-w-[280px] sm:max-w-none leading-relaxed">
            CYBER SECURITY THEMED SOCIAL DEDUCTION
          </h2>
        </div>

        {/* Description Card */}
        <div className="relative mb-12 w-full">
          {/* Corner borders */}
          <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-[#4b6b9e] rounded-tl-sm" />
          <div className="absolute -top-px -right-px w-4 h-4 border-t border-r border-[#4b6b9e] rounded-tr-sm" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-[#4b6b9e] rounded-bl-sm" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-[#4b6b9e] rounded-br-sm" />
          
          <div className="bg-[#111827]/80 backdrop-blur-sm border border-[#1e293b]/50 rounded-lg p-6 sm:p-8 text-center text-sm text-[#94a3b8] leading-relaxed shadow-2xl">
            {HOME_DESCRIPTION}
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center w-full gap-4 max-w-xs">
          <RoomEntry />
          
          <Button 
            variant="outline" 
            className="w-full h-12 bg-transparent border-[#1e293b] text-[#6484b9] hover:bg-[#1e293b]/50 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 mr-2" />
            Kontributor
            <span className="ml-auto text-[#4b6b9e]">&gt;</span>
          </Button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-[0.65rem] tracking-[0.3em] text-[#4b6b9e] font-mono">
        BETA VERSION
      </footer>
      
    </div>
  );
}
