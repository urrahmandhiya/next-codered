import { Terminal, ArrowLeft, Globe, MessageSquare, Code2, Monitor } from "lucide-react";
import Link from "next/link";
import { contributors } from "@/data/contributors";

const IconMap: Record<string, React.ElementType> = {
  globe: Globe,
  message: MessageSquare,
  code: Code2,
  monitor: Monitor,
};

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
        <h2 className="text-cyan-400 text-[0.8rem] tracking-[0.15em] mb-6 font-mono font-medium">
          CORE DEVELOPMENT TEAM
        </h2>

        <div className="flex flex-col w-full gap-4">
          {contributors.map((contrib, idx) => (
            <div 
              key={idx}
              className="bg-[#0D1524] border border-[#1e293b] rounded-xl p-5 flex items-center gap-4 shadow-lg relative overflow-hidden"
            >
              {/* Avatar Placeholder */}
              <div className="w-16 h-16 rounded-full bg-[#1A2332] border-2 border-[#2A3649] flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-xl font-bold text-zinc-300">{contrib.initials}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[1.1rem] font-semibold truncate text-zinc-100">{contrib.name}</h3>
                <p className="text-[0.65rem] text-zinc-400 tracking-widest uppercase font-mono mt-1 leading-tight">
                  {contrib.role}
                </p>
                <p className="text-[0.7rem] text-zinc-500 font-mono mt-1">
                  // {contrib.status}
                </p>
              </div>

              {/* Socials / Actions */}
              <div className="flex gap-2 shrink-0">
                {contrib.socials.slice(0, 2).map((social, sIdx) => {
                  const Icon = IconMap[social.icon] || Globe;
                  return (
                    <a 
                      key={sIdx} 
                      href={social.url} 
                      className="w-9 h-9 rounded-full bg-[#1A2332] border border-[#2A3649] flex items-center justify-center hover:bg-[#2A3649] transition-colors"
                    >
                      <Icon className="w-4 h-4 text-zinc-300" />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
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
