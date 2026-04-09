"use server";

import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const redis = Redis.fromEnv();

export async function createRoom(formData: FormData) {
  const hostId = crypto.randomUUID();
  // generate random 4-characterstring (DCAV)
  const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  const playerStats = {
    name: "PLAYER_1",
  };

  const initialRoomState = {
    status: "waiting",
    hostId: hostId,
    [`player: ${hostId}`]: JSON.stringify(playerStats),
  };

  await redis.hset(`room:${roomCode}`, initialRoomState);

  (await cookies()).set("user_id", hostId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  redirect(`room/${roomCode}`);
}

export type Room = {
  status: string;
  hostId: string;
  players: Player[];
};

type RedisRoom = {
  status: string;
  hostId: string;
  [key: string]: string | Player;
};

export interface Player {
  name: string;
}

export async function getRoomState(
roomCode: string,
): Promise<{ room: Room | null; userId: string | undefined }> {
  const userId = (await cookies()).get("user_id")?.value;
  const data = await redis.hgetall<RedisRoom>(`room:${roomCode}`);

  if (!data) {
    return { room: null, userId };
  }

  const room: Room = {
    status: data.status,
    hostId: data.hostId,
    players: Object.entries(data)
      .filter(([key]) => key.startsWith("player:"))
      .map(([_, val]) => val as Player),
  };

  return { room, userId };
}
