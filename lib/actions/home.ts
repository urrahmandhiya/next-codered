"use server";

import { Redis } from "@upstash/redis";
import { Lock } from "@upstash/lock";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "../definitions";

const redis = Redis.fromEnv();
const DEFAULT_MAX_NUMBER_OF_PLAYERS = 8;

export async function createRoom(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    console.log("[createRoom] Action started");
    console.time("createRoom total");
    const hostId = crypto.randomUUID();
    // generate random 4-characterstring (e.g., ABCD) - still prone to collision
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const playerState = {
        name: formData.get("username"),
        createdAt: Date.now(),
    };

    const initialRoomState = {
        roomStatus: "waiting",
        roomHostId: hostId,
        [`p:${hostId}:name`]: playerState.name,
        [`p:${hostId}:createdAt`]: playerState.createdAt,
        maxPlayersInRoom: DEFAULT_MAX_NUMBER_OF_PLAYERS,
        playersInRoom: 1,
    };

    const p = redis.pipeline();
    p.sadd(`room:${roomCode}:activePlayersIds`, hostId)
    p.hset(`room:${roomCode}`, initialRoomState);

    // keys are set to expire in one hour
    p.expire(`room:${roomCode}`, 3600)
    p.expire(`room:${roomCode}:activePlayersIds`, 3600)

    try {
        console.time("redis pipeline exec");
        await p.exec();
        console.timeEnd("redis pipeline exec");

        (await cookies()).set("user_id", hostId, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
        });
    } catch (error) {
        console.timeEnd("createRoom total");
        if (error instanceof Error) {
            console.error("[createRoom] Error:", error.message);
            return { success: false, error: error.message };
        }
        console.error("[createRoom] Unknown Error:", error);
        return { success: false, error: String(error) };
    }
    console.timeEnd("createRoom total");
    console.log("[createRoom] Success, redirecting to /room/", roomCode);
    redirect(`/room/${roomCode}`);
}

export async function joinRoom(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    console.log("[joinRoom] Action started");
    console.time("joinRoom total");
    const userId = crypto.randomUUID();
    const roomCode = formData.get("room");
    const username = formData.get("username");
    const unixTimeStamp = Date.now();
    const key = `room:${roomCode}`;

    const lock = new Lock({
        id: `lock:${key}`,
        redis,
        lease: 5000,
    });

    const isLockAcquired = await lock.acquire();
    if (!isLockAcquired) {
        return { success: false, error: "Unable to join room. Please try again." };
    }

    try {
        const roomData = await redis.hgetall(key);
        if (!roomData || !Object.hasOwn(roomData, "playersInRoom")) {
            throw new Error(`Room ${roomCode} is not found.`);
        }

        const playersInRoom = Number(roomData.playersInRoom);
        const maxPlayersInRoom = Number(roomData.maxPlayersInRoom);

        if (playersInRoom >= maxPlayersInRoom) {
            throw new Error(`Room ${roomCode} is full.`);
        }

        const newPlayersInRoom = playersInRoom + 1;
        const activePlayersIdsKey = `${key}:activePlayersIds`;

        const pipeline = redis.pipeline();
        pipeline.hset(key, {
            playersInRoom: newPlayersInRoom,
            [`p:${userId}:name`]: username,
            [`p:${userId}:createdAt`]: unixTimeStamp,
        });
        pipeline.sadd(activePlayersIdsKey, userId);
        await pipeline.exec();

        (await cookies()).set("user_id", userId, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
        });
    } catch (error) {
        console.timeEnd("joinRoom total");
        if (error instanceof Error) {
            console.error("[joinRoom] Error:", error.message);
            return { success: false, error: error.message };
        }
        console.error("[joinRoom] Unknown Error:", error);
        return { success: false, error: String(error) };
    } finally {
        await lock.release();
    }

    console.timeEnd("joinRoom total");
    console.log("[joinRoom] Success, redirecting to /room/", roomCode);
    revalidatePath(`/room/${roomCode}`);
    redirect(`/room/${roomCode}`);
}