"use server";

import { Redis } from "@upstash/redis";
import { Lock } from "@upstash/lock";
import { cookies } from "next/headers";
import { ActionResponse, RedisRoom, Role, Room } from "../definitions";
import { revalidatePath } from "next/cache";

const redis = Redis.fromEnv();
const MINIMAL_CURRENTPLAYERS = 4;
const CURRENT_ROLES = ["werewolf", "villager"];
const rolesFallback = CURRENT_ROLES.map((role) => ({ name: role, amount: 1 }));

export async function getRoomState(roomCode: string): Promise<{ room: Room | null; userId: string | undefined }> {
    const userId = (await cookies()).get("user_id")?.value;

    const p = redis.pipeline();

    p.hgetall(`room:${roomCode}`);
    p.smembers(`room:${roomCode}:activePlayersIds`);

    const [roomData, activePlayersIds] = await p.exec<[RedisRoom, string[]]>();

    if (!roomData) {
        return { room: null, userId };
    }

    let roles: Role[] = [];

    if (Object.hasOwn(roomData, "r:werewolf")) {
        for (const role of CURRENT_ROLES) {
            roles.push({ name: role, amount: Number(roomData[`r:${role}`]) });
        }
    } else {
        roles = rolesFallback;
    }

    const room = {
        roomStatus: roomData.roomStatus,
        roomHostId: roomData.roomHostId,
        players: activePlayersIds
            .map((id) => {
                const name = String(roomData[`p:${id}:name`]);
                const createdAt = Number(roomData[`p:${id}:createdAt`]);
                const lastSeen = Number(roomData[`p:${id}:lastSeen`] || createdAt);
                const role = String(roomData[`p:${id}:role`] ?? "none");
                return {
                    name,
                    createdAt,
                    lastSeen,
                    role,
                    id: String(id),
                    isHost: String(id) === roomData.roomHostId,
                };
            }),
        maxPlayersInRoom: roomData.maxPlayersInRoom,
        playersInRoom: roomData.playersInRoom,
        roles: roles,
    };

    if (userId && activePlayersIds.includes(userId)) {
        await redis.hset(`room:${roomCode}`, { [`p:${userId}:lastSeen`]: Date.now() });
    }

    if (room.roomStatus === "waiting") {
        const now = Date.now();
        for (const player of room.players) {
            if (player.id !== userId && now - player.lastSeen > 12000) {
                await deletePlayer(roomCode, player.id);
            }
        }
    }

    return { room, userId };
}

export async function startGame(roomCode: string): Promise<ActionResponse> {
    const key = `room:${roomCode}`;
    const jsonRoles = JSON.stringify(CURRENT_ROLES.map((role) => `r:${role}`));
    const script = `
    local key = KEYS[1]
    local activePlayersIdsKey = key .. ':activePlayersIds'
    local MINIMAL_CURRENTPLAYERS = ARGV[1]

    local roomMetaData = redis.call('HGET', key, 'playersInRoom')
    
    local playersInRoom = tonumber(roomMetaData)
    local minimumPlayers = tonumber(MINIMAL_CURRENTPLAYERS)
    
    if playersInRoom < minimumPlayers then
       return 'INSUFFICIENT_PLAYERS'
    end

    local isRoleExist = redis.call('HEXISTS', key, 'r:werewolf')

    if isRoleExist == 0 then
        return 'ROLE_IS_NOT_CONFIGURED'
    end

    local rolesFields = cjson.decode(ARGV[2])
    local roles = redis.call('HMGET', key, unpack(rolesFields))
    local totalRoles = 0

    for field, value in pairs(roles) do
        totalRoles = totalRoles + tonumber(value)
    end
    
    if playersInRoom ~= totalRoles then
        return 'ROLES_AND_PLAYERS_AMOUNT_MISMATCHED'
    end
    
    local playersIds = redis.call('SMEMBERS', activePlayersIdsKey)

    -- shuffle the playersIds --
    for i = #playersIds, 2, -1 do
        local j = math.random(i)
        playersIds[i], playersIds[j] = playersIds[j], playersIds[i]
    end

    local initialGameState = {}
    
    local playerIdsIndex = 0
    for index, amount in pairs(roles) do
        for i=1, tonumber(amount) do
            playerIdsIndex = playerIdsIndex + 1
            table.insert(initialGameState, 'p:' .. playersIds[playerIdsIndex] .. ':role')
            table.insert(initialGameState, string.sub(rolesFields[index], 3))
        end
    end

    local newRoomStatus = {['roomStatus'] = 'playing'}
    for k, v in pairs(newRoomStatus) do
        table.insert(initialGameState, k)
        table.insert(initialGameState, v)
    end

    redis.call('HSET', key, unpack(initialGameState))
    return 'playing'
  `;

    try {
        const result = await redis.eval(script, [key], [MINIMAL_CURRENTPLAYERS, jsonRoles]);

        switch (result) {
            case "INSUFFICIENT_PLAYERS":
                throw new Error(
                    `Insufficient players. Minimal number of players to start the game is ${MINIMAL_CURRENTPLAYERS}`,
                );

            case "ROLES_AND_PLAYERS_AMOUNT_MISMATCHED":
                throw new Error(
                    "Number of players and total roles are mismatched. Ask the host to configure it",
                );

            case "ROLE_IS_NOT_CONFIGURED":
                throw new Error(
                    "Roles amount is not configured. Ask the host to configure it",
                );

            default:
                break;
        }

        return { success: true, message: String(result) };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        } else {
            return { success: false, error: String(error) };
        }
    }
}

export async function updateRoomSettings(roomCode: string, prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const key = `room:${roomCode}`;
    const playerCapacity = formData.get("player-cap");
    const roles = CURRENT_ROLES.map((role) => ({ [`${role}`]: formData.get(`${role}-amount`) }));
    const jsonRoles = JSON.stringify(Object.assign({}, ...roles));

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

    local newRoomSettings = {["maxPlayersInRoom"] = tonumber(newMaxPlayersInRoom)}
    local roles = cjson.decode(ARGV[2])
    local flat_table = {};

    for k, v in pairs(newRoomSettings) do
        roles[k] = v
    end

    for field, value in pairs(roles) do
        if field == "maxPlayersInRoom" then
            table.insert(flat_table, field)
            table.insert(flat_table, tonumber(value))
        else
            table.insert(flat_table, "r:" .. field)
            table.insert(flat_table, tonumber(value))
        end
    end

    redis.call('HSET', key, unpack(flat_table))
    return "SUCCESS"
    `;

    try {
        const result = await redis.eval(script, [key], [playerCapacity, jsonRoles])
        switch (result) {
            case "GAME_IS_STARTING":
                throw new Error("Game is starting, unable to change room settings now")

            case "PLAYER_IN_ROOM_EXCEEDS_NEW_CAPACITY":
                throw new Error("Number of players in room exceeds new capacity")

            default:
                break;
        }
        revalidatePath(`/room/${roomCode}`)
        return { success: true, message: "Room settings changed" }
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        } else {
            return { success: false, error: String(error) };
        }
    }
}

export async function deletePlayer(roomCode: string, id: string): Promise<ActionResponse> {
    const key = `room:${roomCode}`;
    const activePlayersIdsKey = `${key}:activePlayersIds`;

    const lock = new Lock({
        id: `lock:${key}`,
        redis,
        lease: 5000,
    });

    const isLockAcquired = await lock.acquire();
    if (!isLockAcquired) {
        return { success: false, error: "Unable to delete player due to high traffic. Try again." };
    }

    try {
        const roomData = await redis.hmget(key, "playersInRoom", "roomStatus", `p:${id}:name`);
        if (!roomData) {
            throw new Error("Room not found");
        }

        const playersInRoom = Number(roomData.playersInRoom);
        const roomStatus = String(roomData.roomStatus);
        const deletedPlayerName = String(roomData[`p:${id}:name`]);

        if (roomStatus !== "waiting") {
            throw new Error("Game is starting, cannot delete a player");
        }

        const deletedFieldsCount = await redis.hdel(key, `p:${id}:name`, `p:${id}:createdAt`, `p:${id}:lastSeen`, `p:${id}:role`);
        
        if (deletedFieldsCount >= 2) {
            const newCurrentPlayer = playersInRoom - 1;
            const pipeline = redis.pipeline();
            pipeline.hset(key, { playersInRoom: newCurrentPlayer });
            pipeline.srem(activePlayersIdsKey, id);
            await pipeline.exec();
            
            revalidatePath(`/room/${roomCode}`);
            return { success: true, message: `Player ${deletedPlayerName} deleted successfully` };
        } else {
            throw new Error("Failed to delete a player");
        }
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: String(error) };
    } finally {
        await lock.release();
    }
}

export async function updatePlayerName(roomCode: string, prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const userId = (await cookies()).get("user_id")?.value;
    const username = formData.get("username");
    const key = `room:${roomCode}`;
    try {
        await redis.hset(key, { [`p:${userId}:name`]: username });
        return { success: true, message: "Name changed successfully" }
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message }
        } else {
            return { success: false, error: String(error) }
        }
    }
}