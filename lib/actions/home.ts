"use server";

import { Redis } from "@upstash/redis";
import { Lock } from "@upstash/lock";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "../definitions";

const redis = Redis.fromEnv();
const INITIAL_ROOM_DEFAULTS = {
    MAX_NUMBER_OF_PLAYERS: 8,
    PLAYERS_IN_ROOM: 1,
    DISCUSS_DURATION: 15,
    VOTE_DURATION: 15,
    KEY_TTL: 300,
    MAX_CONCURRENT_ROOM: 3,
}

async function generateUniqueRoomCode(): Promise<string> {
    const MAX_ATTEMPTS = 3;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const candidate = Math.random().toString(36).substring(2, 6).toUpperCase();
        const roomAlreadyExists = await redis.exists(`room:${candidate}`);
        if (!roomAlreadyExists) return candidate;
    }
    throw new Error("Failed to generate a unique room code. Please try again.");
}

export async function createRoom(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    console.log("[createRoom] Action started");
    console.time("createRoom total");

    const username = formData.get("username");
    if (!username || typeof username !== "string" || username.trim() === "") {
        console.timeEnd("createRoom total");
        return { success: false, error: "Username is required." };
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
        console.timeEnd("createRoom total");
        return { success: false, error: "Username must be at least 2 characters long." };
    }

    const hostId = crypto.randomUUID();
    const roomCode = await generateUniqueRoomCode();
    const playerState = {
        name: trimmedUsername,
        createdAt: Date.now(),
    };

    const initialRoomState = {
        roomStatus: "waiting",
        roomHostId: hostId,
        [`p:${hostId}:name`]: playerState.name,
        [`p:${hostId}:createdAt`]: playerState.createdAt,
        maxPlayersInRoom: INITIAL_ROOM_DEFAULTS.MAX_NUMBER_OF_PLAYERS,
        playersInRoom: INITIAL_ROOM_DEFAULTS.PLAYERS_IN_ROOM,
        discussDuration: INITIAL_ROOM_DEFAULTS.DISCUSS_DURATION,
        voteDuration: INITIAL_ROOM_DEFAULTS.VOTE_DURATION,
    };

    const lock = new Lock({
        id: "lock:createRoom",
        redis,
        lease: 5000,
    });

    let isLockAcquired = false;
    try {
        isLockAcquired = await lock.acquire();
        if (!isLockAcquired) {
            return { success: false, error: "Unable to create room due to lock conflict. Please try again." };
        }

        let cursor = "0";
        const stringKeys: string[] = [];
        do {
            const [nextCursor, keys] = await redis.scan(cursor, {
                match: "room:*",
                type: "hash"
            });
            stringKeys.push(...keys);
            cursor = nextCursor;
        } while (cursor !== "0");
        console.log("[Scanned Keys]", stringKeys);

        if (stringKeys.length >= INITIAL_ROOM_DEFAULTS.MAX_CONCURRENT_ROOM) {
            return { success: false, error: "Unable to create more room due to max concurrent room. Please try again later." };
        }

        const p = redis.pipeline();
        p.sadd(`room:${roomCode}:activePlayersIds`, hostId);
        p.sadd(`room:${roomCode}:deadPlayersIds`, '__EMPTY__');
        p.hset(`room:${roomCode}`, initialRoomState);

        // keys are set to expire in one hour
        p.expire(`room:${roomCode}`, INITIAL_ROOM_DEFAULTS.KEY_TTL);
        p.expire(`room:${roomCode}:activePlayersIds`, INITIAL_ROOM_DEFAULTS.KEY_TTL);
        p.expire(`room:${roomCode}:deadPlayersIds`, INITIAL_ROOM_DEFAULTS.KEY_TTL);

        console.time("redis pipeline exec");
        await p.exec();
        console.timeEnd("redis pipeline exec");

        (await cookies()).set("user_id", hostId, {
            httpOnly: false,
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
    } finally {
        if (isLockAcquired) {
            await lock.release();
        }
    }
    console.timeEnd("createRoom total");
    console.log("[createRoom] Success, redirecting to /room/", roomCode);
    redirect(`/room/${roomCode}`);
}

export async function joinRoom(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    console.log("[joinRoom] Action started");
    console.time("joinRoom total");

    const rawRoomCode = formData.get("room");
    const rawUsername = formData.get("username");

    if (!rawRoomCode || typeof rawRoomCode !== "string" || rawRoomCode.trim() === "") {
        console.timeEnd("joinRoom total");
        return { success: false, error: "Room code is required." };
    }
    if (!rawUsername || typeof rawUsername !== "string" || rawUsername.trim() === "") {
        console.timeEnd("joinRoom total");
        return { success: false, error: "Username is required." };
    }

    const username = rawUsername.trim();
    if (username.length < 2) {
        console.timeEnd("joinRoom total");
        return { success: false, error: "Username must be at least 2 characters long." };
    }

    const roomCode = rawRoomCode.trim().toUpperCase();

    const userId = crypto.randomUUID();
    const unixTimeStamp = Date.now();
    const key = `room:${roomCode}`;

    const lock = new Lock({
        id: `lock:${key}`,
        redis,
        lease: 5000,
    });

    let isLockAcquired = false;
    try {
        isLockAcquired = await lock.acquire();
        if (!isLockAcquired) {
            console.timeEnd("joinRoom total");
            return { success: false, error: "Unable to join room due to lock conflict. Please try again." };
        }

        const roomData = await redis.hgetall(key);
        if (!roomData || !Object.hasOwn(roomData, "playersInRoom")) {
            throw new Error(`Room ${roomCode} is not found.`);
        }

        const playersInRoom = Number(roomData.playersInRoom);
        const maxPlayersInRoom = Number(roomData.maxPlayersInRoom);

        if (playersInRoom >= maxPlayersInRoom) {
            throw new Error(`Room ${roomCode} is full.`);
        }

        const takenUsernames = Object.entries(roomData)
            .filter(([field]) => field.endsWith(":name"))
            .map(([, value]) => String(value).toLowerCase());

        if (takenUsernames.includes(username.toLowerCase())) {
            throw new Error(`The username "${username}" is already taken in this room.`);
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
            httpOnly: false,
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
        if (isLockAcquired) {
            await lock.release();
        }
    }

    console.timeEnd("joinRoom total");
    console.log("[joinRoom] Success, redirecting to /room/", roomCode);
    revalidatePath(`/room/${roomCode}`);
    redirect(`/room/${roomCode}`);
}
