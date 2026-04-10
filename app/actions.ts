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
    currentPlayer: 1,
  };

  await redis.hset(`room:${roomCode}`, initialRoomState);

  (await cookies()).set("user_id", hostId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  redirect(`/room/${roomCode}`);
}

export async function joinRoom(formData: FormData) {
  const userId = crypto.randomUUID();
  const roomCode = formData.get("room");
  const key = `room:${roomCode}`;

  // lua script
  const script = `
    local roomCode = KEYS[1]
    local userId = ARGV[1]

    local roomMetaData = redis.call('HMGET', roomCode, 'currentPlayer', 'maxPlayer')
    local currentPlayer = tonumber(roomMetaData[1])
    local maxPlayer = tonumber(roomMetaData[2])

    if currentPlayer and maxPlayer and currentPlayer < maxPlayer then
      local newCurrentPlayer = currentPlayer + 1
      local playerName = "PLAYER_" .. newCurrentPlayer
      local initialPlayerState = cjson.encode({ name = playerName })
      redis.call('HSET', roomCode, 'currentPlayer', newCurrentPlayer, 'player: ' .. userId, initialPlayerState)
      return newCurrentPlayer
    else
      return 'ROOM_FULL'
    end
  `;

  const result = await redis.eval(script, [key], [userId]);

  if (result === "ROOM_FULL") {
    throw new Error("room is full");
  }

  (await cookies()).set("user_id", userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  redirect(`/room/${roomCode}`);
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
