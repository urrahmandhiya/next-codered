"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { ActionResponse, ActionState, ActivePlayersIds, RedisRoom, Room } from "../definitions";
import { revalidatePath } from "next/cache";

const redis = Redis.fromEnv();
const MINIMAL_CURRENTPLAYERS = 4;

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

export async function updatePlayerName(roomCode: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const userId = (await cookies()).get("user_id")?.value;
    const username = formData.get("username");
    const key = `room:${roomCode}`;
    try {
        await redis.hset(key, { [`p:${userId}:name`]: username });
        return { message: "Name changed successfully" }
    } catch (error) {
        if (error instanceof Error) {
            return { message: error.message }
        } else {
            return { error: String(error) }
        }
    }
}