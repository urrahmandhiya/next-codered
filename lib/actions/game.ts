"use server";

import { ActionResponse } from "@/lib/definitions";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";

const redis = Redis.fromEnv();

export async function getPlayerVote(roomCode: string, voteId: string): Promise<ActionResponse> {
    const upperCode = roomCode.toUpperCase();
    const userId = (await cookies()).get("user_id")?.value;
    const key = `room:${upperCode}`;
    console.log("[Vote Id Sent]", voteId)

    try {
        await redis.hset(key, { [`p:${userId}:vote`]: voteId })
        return { success: true, message: "getting player vote..." };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: String(error) };
    }
}
