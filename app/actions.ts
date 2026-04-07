'use server'

import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const redis = Redis.fromEnv();

export async function createRoom(formData: FormData) {
    const hostId = crypto.randomUUID();
    // generate random 4-characterstring (DCAV)
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    const initialRoomState = {
        status: 'waiting',
        players: [
            {
                id: hostId,
                name: 'PLAYER_1',
                isHost: true,
            }
        ]
    };

    await redis.set(`room:${roomCode}`, initialRoomState);

    (await cookies()).set('user_id', hostId, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
    });

    redirect(`room/${roomCode}`);
}

export interface Room {
    status: string;
    players: Player[];
}

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

export async function getRoomState(roomCode: string): Promise<{room: Room | null; userId: string | undefined}> {
    const userId = (await cookies()).get('user_id')?.value;
    const room = await redis.get<Room>(`room:${roomCode}`);

    return {room, userId}
}