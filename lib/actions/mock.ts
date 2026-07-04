// FOR DEVELOPMENT ONLY

"use server"

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const redis = Redis.fromEnv();
const CURRENT_ROLES = ["werewolf", "villager"];

export async function goToWaitingRoom() {
    const hostId = crypto.randomUUID();
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const hostState = {
        name: 'PLAYER_1_HOST',
        createdAt: Date.now(),
    };

    const playersState: { [key: string]: string | number } = {};
    const playerIds = [];

    for (let i = 0; i < 3; i++) {
        const playerId = crypto.randomUUID();
        const playerCreatedAt = Date.now() + i;
        playersState[`p:${playerId}:name`] = `PLAYER_${i + 2}`;
        playersState[`p:${playerId}:createdAt`] = playerCreatedAt;
        playerIds.push(playerId);
    }

    const initialRoomState = {
        roomStatus: "waiting",
        roomHostId: hostId,
        [`p:${hostId}:name`]: hostState.name,
        [`p:${hostId}:createdAt`]: hostState.createdAt,
        maxPlayersInRoom: 4,
        playersInRoom: 4,
        discussDuration: 15,
        voteDuration: 15,
    };

    const rolesState: { [key: string]: string | number } = {}

    for (const role of CURRENT_ROLES) {
        if (role === "villager") {
            rolesState[`r:${role}`] = playerIds.length;
        } else {
            rolesState[`r:${role}`] = 1;
        }
    }

    const p = redis.pipeline();
    p.sadd(`room:${roomCode}:activePlayersIds`, hostId, ...playerIds);
    p.sadd(`room:${roomCode}:deadPlayersIds`, '__EMPTY__');
    p.hset(`room:${roomCode}`, { ...initialRoomState, ...playersState, ...rolesState});

    // keys are set to expire in one hour
    p.expire(`room:${roomCode}`, 3600)
    p.expire(`room:${roomCode}:activePlayersIds`, 3600)
    p.expire(`room:${roomCode}:deadPlayersIds`, 3600)

    try {
        await p.exec();

        (await cookies()).set("user_id", hostId, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
        });
    } catch (error) {
        console.log(error)
    }
    redirect(`/room/${roomCode}`);
}