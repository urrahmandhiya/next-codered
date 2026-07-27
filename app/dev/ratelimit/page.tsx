"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkDailyRateLimit, RatelimitResponseWithIdentifier } from "@/lib/ratelimit";

export default function Ratelimit() {
  const [dailyState, setDailyState] = useState<RatelimitResponseWithIdentifier | undefined>();
  const [loading, setLoading] = useState(false);

  const [dailyCount, setDailyCount] = useState(1);

  const diffInSeconds = (date1: Date, date2: Date): number => {
    return Math.floor((date2.getTime() - date1.getTime()) / 1000);
  }

  const handeCheckRatelimit = async () => {
    setLoading(true);

    const dailyResult = await checkDailyRateLimit(1);
    console.log(dailyResult);

    setDailyState(dailyResult);

    const dailyDiffInSeconds: number = diffInSeconds(new Date(), new Date(dailyResult?.reset || new Date()))

    setDailyCount(dailyDiffInSeconds);

    setLoading(false);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setDailyCount((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [dailyState]);

  const dailyInHours = String(Math.floor((dailyCount % 86400) / 3600)).padStart(2, "0");
  const dailyInMinutes = String(Math.floor((dailyCount % 3600) / 60)).padStart(2, "0");
  const dailyInSeconds = String(Math.floor(dailyCount % 60)).padStart(2, "0");

  return (
    <div className="relative w-full h-dvh">
      {/* Floating Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dev"
          className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-cyan/30 hover:border-cyan/60 rounded-full text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan" />
          BACK TO DEV TOOLS
        </Link>
      </div>

      <div>
        <div className="flex flex-col h-full w-full max-w-105 mx-auto pt-17.5 pb-4 gap-4">
          <div className="flex flex-col items-center pt-6 gap-2">
            <span className="font-mono text-[11px] tracking-[0.2em] text-cyan/70 uppercase">
              DAILY RATELIMIT ({`${dailyState?.identifier}}`})
            </span>
          </div>

          <div className="w-full h-0.5 bg-slate-800 rounded-full">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${0}%` }}
            />
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="py-1 px-4">Success</th>
                <th className="py-1 px-4">Limit</th>
                <th className="py-1 px-4">Remaining</th>
                <th className="py-1 px-4">Reset</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-xl text-center">
                <td className="font-mono font-bold leading-none tracking-[2px]">{dailyState?.success ? 'TRUE' : '-'}</td>
                <td className="font-mono font-bold leading-none tracking-[2px]">{dailyState ? dailyState.limit : '-'}</td>
                <td className="font-mono font-bold leading-none tracking-[2px]">{dailyState ? dailyState.remaining : '-'}</td>
                <td className="font-mono font-bold leading-none tracking-[2px]">
                  <div className="text-left">
                    {dailyState
                      ?
                      <div>
                        <div>{`${dailyInHours} HOURS`}</div>
                        <div>{`${dailyInMinutes} MINUTES`}</div>
                        <div>{`${dailyInSeconds} SECONDS`}</div>
                      </div>
                      :
                      <div className="text-center">-</div>
                    }
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <Button onClick={handeCheckRatelimit} disabled={loading} >Check Rate Limit</Button>
        </div>
      </div>
    </div>
  );
};
