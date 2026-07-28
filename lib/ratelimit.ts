"use server"

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isDev = process.env.NEXT_PUBLIC_MODE === "DEV";

const redis = Redis.fromEnv();
const ratelimit = {
    // enabling analytics, increase all calls by 1 more command (use it wisely)
    daily: new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(Number(45), "1d"),
        // analytics: false,
    }),
};


export async function checkDailyRateLimit(rate: number): Promise<RatelimitResponseWithIdentifier> {
    const timeFormat = new Date().toISOString().split('T')[0];
    const identifier = isDev ? "dev:" + timeFormat : timeFormat;
    const dailyRatelimit = await ratelimit.daily.limit(`ratelimit:${identifier}`, { rate: rate });
    return {
        ...dailyRatelimit,
        identifier,
    }
}


type RatelimitResponse = Awaited<ReturnType<Ratelimit["limit"]>>;
export type RatelimitResponseWithIdentifier = RatelimitResponse & { identifier: string; }
