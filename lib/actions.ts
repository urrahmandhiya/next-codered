"use server";

import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ActionResponse, ActionState, ActivePlayersIds, RedisRoom, Room } from "./definitions";
import { revalidatePath } from "next/cache";

const redis = Redis.fromEnv();
const DEFAULT_MAX_NUMBER_OF_PLAYERS = 8;
const MINIMAL_CURRENTPLAYERS = 4;

export async function createRoom(prevState: ActionState, formData: FormData): Promise<ActionState> {
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
    await p.exec();

    (await cookies()).set("user_id", hostId, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { error: String(error) };
  }
  redirect(`/room/${roomCode}`);
}

export async function joinRoom(prevState: ActionState, formData: FormData,): Promise<ActionState> {
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
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { error: String(error) };
  }

  revalidatePath(`/room/${roomCode}`);
  redirect(`/room/${roomCode}`);
}

export async function getRoomState(roomCode: string): Promise<{ room: Room | null; userId: string | undefined }> {
  const userId = (await cookies()).get("user_id")?.value;

  const p = redis.pipeline();

  p.hgetall(`room:${roomCode}`);
  p.smembers(`room:${roomCode}:activePlayersIds`)

  const [roomData, activePlayersIds] = await p.exec<[RedisRoom, ActivePlayersIds[]]>();

  if (!roomData) {
    return { room: null, userId };
  }

  const room = {
    roomStatus: roomData.roomStatus,
    roomHostId: roomData.roomHostId,
    players: activePlayersIds
      .map((id) => {
        const name = String(roomData[`p:${id}:name`]);
        const createdAt = Number(roomData[`p:${id}:createdAt`]);
        return {
          name,
          createdAt,
          id: String(id),
          isHost: String(id) === roomData.roomHostId,
        };
      }),
    maxPlayersInRoom: roomData.maxPlayersInRoom,
    playersInRoom: roomData.playersInRoom,
  };

  return { room, userId };
}

export async function startGame(roomCode: string): Promise<ActionResponse> {
  const key = `room:${roomCode}`;
  const script = `
    local key = KEYS[1]
    local MINIMAL_CURRENTPLAYERS = ARGV[1]

    local roomMetaData = redis.call('HGET', key, 'playersInRoom')
    
    local playersInRoom = tonumber(roomMetaData)
    local minimumPlayers = tonumber(MINIMAL_CURRENTPLAYERS)

    if playersInRoom >= minimumPlayers then
      local newRoomStatus = 'playing'
      redis.call('HSET', key, 'roomStatus', newRoomStatus)
      return newRoomStatus
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

export async function updateRoomSettings(roomCode: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const playerCapacity = formData.get("player-cap");
  const key = `room:${roomCode}`;
  const script = `
    local key = KEYS[1]
    local playerCapacity = ARGV[1]
    local newMaxPlayersInRoom = tonumber(playerCapacity)

    local roomMetaData = redis.call('HMGET', key, 'playersInRoom', 'roomStatus')

    local playersInRoom = tonumber(roomMetaData[1])
    local roomStatus = roomMetaData[2]

    if roomStatus ~= "waiting" then
      return "GAME_IS_STARTING"
    end

    if newMaxPlayersInRoom < playersInRoom then
      return "PLAYER_IN_ROOM_EXCEEDS_NEW_CAPACITY"
    end
    
    redis.call('HSET', key, 'maxPlayersInRoom', newMaxPlayersInRoom)
    return "SUCCESS"
    `;

  try {
    const result = await redis.eval(script, [key], [playerCapacity])
    switch (result) {
      case "GAME_IS_STARTING":
        throw new Error("Game is starting, unable to change room settings now")

      case "PLAYER_IN_ROOM_EXCEEDS_NEW_CAPACITY":
        throw new Error("Number of players in room exceeds new capacity")

      default:
        break;
    }
    revalidatePath(`/room/${roomCode}`)
    return { error: null, message: "Room settings changed" }
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message };
    } else {
      return { error: String(error) };
    }
  }
}

export async function deletePlayer(roomCode: string, id: string): Promise<ActionResponse> {
  const key = `room:${roomCode}`;
  const script = `
    local key = KEYS[1]
    local playerId = ARGV[1]
    local activePlayersIdsKey = key .. ':activePlayersIds'

    local playerName = 'p:' .. playerId .. ':name'
    local playerCreatedAt = 'p:' .. playerId .. ':createdAt'

    local roomMetaData = redis.call('HMGET', key, 'playersInRoom', 'roomStatus', playerName)

    local playersInRoom = tonumber(roomMetaData[1])
    local roomStatus = roomMetaData[2]
    local deletedPlayerName = roomMetaData[3]

    if roomStatus ~= "waiting" then
      return 'GAME_IS_STARTNG'
    end

    local deletedPlayer = redis.call('HDEL', key, playerName, playerCreatedAt)
    
    if deletedPlayer == 2 then
      local newCurrentPlayer = playersInRoom - 1
      redis.call('HSET', key, 'playersInRoom', newCurrentPlayer)
      redis.call('SREM', activePlayersIdsKey, playerId)
      return deletedPlayerName
    else
      return "FAILED"
    end
  `;

  try {
    const result = await redis.eval(script, [key], [id]);
    switch (result) {
      case "GAME_IS_STARTING":
        throw new Error("Game is starting, cannot delete a player")

      case "FAILED":
        throw new Error("Failed to delete a player")

      default:
        break;
    }
    revalidatePath(`/room/${roomCode}`)
    return { error: null, success: `Player ${result} deleted successfully` }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, success: null }
    } else {
      return { error: String(error), success: null }
    }
  }
}

const updatePlayerName = ({ roomCode, username, userId }: { roomCode: string, username: string, userId: string }) => {

}