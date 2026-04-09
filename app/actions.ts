"use server";

import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const redis = Redis.fromEnv();

export async function createRoom(formData: FormData) {
  const hostId = crypto.randomUUID();
  // generate random 4-characterstring (e.g., ABCD)
  const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const playerStats = {
    name: "PLAYER_1",
  };

  const initialRoomState = {
    status: "waiting",
    hostId: hostId,
    [`player: ${hostId}`]: JSON.stringify(playerStats),
    maxPlayer: 4,
    currentPlayer: 0,
  };

  const pipeline = redis.pipeline();
  pipeline.hset(`room:${roomCode}`, initialRoomState);
  pipeline.hincrby(`room:${roomCode}`, "currentPlayer", 1);
  await pipeline.exec();

  (await cookies()).set("user_id", hostId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  redirect(`room/${roomCode}`);
}

export interface Room {
  status: string;
  hostId: string;
  players: Player[];
  maxPlayer: number;
  currentPlayer: number;
}

type RoomMetaData = {
  status: string; // implement enums later
  hostId: string;
  maxPlayer: number;
  currentPlayer: number;
};

type DynamicPlayers = {
  [key: string]: string | Player;
};

type RedisRoom = RoomMetaData & DynamicPlayers;

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
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
      .filter(([key]) => key.startsWith("player: "))
      .map(([key, val]) => {
        const playerData = val as Player; // redis already return as Object
        const playerId = key.replace("player: ", "");

        return {
          ...playerData,
          id: playerId,
          isHost: playerId === data.hostId,
        };
      }),
    maxPlayer: data.maxPlayer,
    currentPlayer: data.currentPlayer,
  };

  return { room, userId };
}
