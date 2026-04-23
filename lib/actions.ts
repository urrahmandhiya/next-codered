"use server";

import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ActionState, Player, RedisRoom, Room } from "./definitions";

const redis = Redis.fromEnv();
const MAX_NUMBER_OF_PLAYERS = 4;
const MINIMAL_CURRENTPLAYERS = 3;

export async function createRoom(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const hostId = crypto.randomUUID();
  // generate random 4-characterstring (e.g., ABCD) - still prone to collision
  const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const playerStats = {
    name: "PLAYER_1",
    createdAt: Date.now(),
  };

  const initialRoomState = {
    status: "waiting",
    hostId: hostId,
    [`player: ${hostId}`]: JSON.stringify(playerStats),
    maxPlayer: MAX_NUMBER_OF_PLAYERS,
    currentPlayer: 1,
  };

  try {
    await redis.hset(`room:${roomCode}`, initialRoomState);

    (await cookies()).set("user_id", hostId, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: null, error: error.message };
    }
    return { success: null, error: String(error) };
  }
  redirect(`/room/${roomCode}`);
}

export async function joinRoom(prevState: ActionState, formData: FormData,): Promise<ActionState> {
  const userId = crypto.randomUUID();
  const roomCode = formData.get("room");
  const unixTimeStamp = Date.now();
  const key = `room:${roomCode}`;

  // lua script
  const script = `
    local roomCode = KEYS[1]
    local userId = ARGV[1]
    local unixTimeStamp = ARGV[2]

    local isKeyExist = redis.call('HEXISTS', roomCode, 'currentPlayer')

    if isKeyExist == 0 then
      return 'ROOM_NOT_FOUND'
    end
    
    local roomMetaData = redis.call('HMGET', roomCode, 'currentPlayer', 'maxPlayer')
    local currentPlayer = tonumber(roomMetaData[1])
    local maxPlayer = tonumber(roomMetaData[2])

    if currentPlayer and maxPlayer and currentPlayer < maxPlayer then
      local newCurrentPlayer = currentPlayer + 1
      local playerName = "PLAYER_" .. newCurrentPlayer
      local initialPlayerState = cjson.encode({ name = playerName, createdAt = tonumber(unixTimeStamp) })
      redis.call('HSET', roomCode, 'currentPlayer', newCurrentPlayer, 'player: ' .. userId, initialPlayerState)
      return newCurrentPlayer
    else
      return 'ROOM_FULL'
    end
  `;

  try {
    const result = await redis.eval(script, [key], [userId, unixTimeStamp]);

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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: null, error: error.message };
    }
    return { success: null, error: String(error) };
  }

  redirect(`/room/${roomCode}`);
}

export async function getRoomState(roomCode: string): Promise<{ room: Room | null; userId: string | undefined }> {
  const userId = (await cookies()).get("user_id")?.value;
  const data = await redis.hgetall<RedisRoom>(`room:${roomCode}`);

  if (!data) {
    return { room: null, userId };
  }

  const room = {
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

type actionResponse =
  | { success: null; error: string }
  | { success: string; error: null };

export async function startGame(roomCode: string): Promise<actionResponse> {
  const key = `room:${roomCode}`;
  const script = `
    local roomCode = KEYS[1]
    local MINIMAL_CURRENTPLAYERS = ARGV[1]

    local roomMetaData = redis.call('HGET', roomCode, 'currentPlayer')
    
    local currentPlayer = tonumber(roomMetaData)
    local minimumPlayers = tonumber(MINIMAL_CURRENTPLAYERS)

    if currentPlayer >= minimumPlayers then
      local currentStatus = 'playing'
      redis.call('HSET', roomCode, 'status', currentStatus)
      return currentStatus
    else
      return 'INSUFFICIENT_PLAYERS'
    end
  `;

  try {
    const result = await redis.eval(script, [key], [MINIMAL_CURRENTPLAYERS]);

    if (result === "INSUFFICIENT_PLAYERS") {
      throw new Error(
        `Insufficient players. minimal number of players to start the game is ${MINIMAL_CURRENTPLAYERS}`,
      );
    }
    return { success: String(result), error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { success: null, error: error.message };
    } else {
      return { success: null, error: String(error) };
    }
  }
}

export async function getPlayerCookies() {
  const userCookies = (await cookies()).get("user_id");
  return userCookies;
}
