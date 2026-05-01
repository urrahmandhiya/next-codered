"use server";

import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionState } from "../definitions";

const redis = Redis.fromEnv();
const DEFAULT_MAX_NUMBER_OF_PLAYERS = 8;

export async function createRoom(prevState: ActionState, formData: FormData): Promise<ActionState> {
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
            return { message: error.message };
        }
        console.error("[createRoom] Unknown Error:", error);
        return { error: String(error) };
    }
    console.timeEnd("createRoom total");
    console.log("[createRoom] Success, redirecting to /room/", roomCode);
    redirect(`/room/${roomCode}`);
}

export async function joinRoom(prevState: ActionState, formData: FormData,): Promise<ActionState> {
    console.log("[joinRoom] Action started");
    console.time("joinRoom total");
    const userId = crypto.randomUUID();
    const roomCode = formData.get("room");
    const username = formData.get("username")
    const unixTimeStamp = Date.now();
    const key = `room:${roomCode}`;

    // lua script
    const script = `
    local key = KEYS[1]
    local userId = ARGV[1]
    local unixTimeStamp = ARGV[2]
    local username = ARGV[3]
    local activePlayersIdsKey = key .. ':activePlayersIds'

    local isKeyExist = redis.call('HEXISTS', key, 'playersInRoom')

    if isKeyExist == 0 then
      return 'ROOM_NOT_FOUND'
    end
    
    local roomMetaData = redis.call('HMGET', key, 'playersInRoom', 'maxPlayersInRoom')
    local playersInRoom = tonumber(roomMetaData[1])
    local maxPlayersInRoom = tonumber(roomMetaData[2])

    if playersInRoom < maxPlayersInRoom then
      local newPlayersInRoom = playersInRoom + 1
      redis.call(
          'HSET', 
          key, 
          'playersInRoom', newPlayersInRoom, 
          'p:' .. userId .. ':name', username, 
          'p:' .. userId .. ':createdAt', unixTimeStamp 
      )
      redis.call('SADD', activePlayersIdsKey, userId)
      return newPlayersInRoom
    else
      return 'ROOM_FULL'
    end
  `;

    try {
        const result = await redis.eval(script, [key], [userId, unixTimeStamp, username]);

        switch (result) {
            case "ROOM_FULL":
                throw new Error(`Room ${roomCode} is full.`);

            case "ROOM_NOT_FOUND":
                throw new Error(`Room ${roomCode} is not found.`);

            default:
                break;
        }

        (await cookies()).set("user_id", userId, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
        });
    } catch (error) {
        console.timeEnd("joinRoom total");
        if (error instanceof Error) {
            console.error("[joinRoom] Error:", error.message);
            return { message: error.message };
        }
        console.error("[joinRoom] Unknown Error:", error);
        return { error: String(error) };
    }

    console.timeEnd("joinRoom total");
    console.log("[joinRoom] Success, redirecting to /room/", roomCode);
    revalidatePath(`/room/${roomCode}`);
    redirect(`/room/${roomCode}`);
}