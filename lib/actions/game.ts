"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { GameState, RedisGameRoom } from "../definitions";

const redis = Redis.fromEnv();

export async function getGameState(roomCode: string): Promise<{ gameState: GameState | null; activePlayersIds: string[] }> {
    const userId = (await cookies()).get("user_id")?.value;
    const key = `room:${roomCode}`;
    const configuredDuration = 20 * 1000;
    const currentTime = Date.now();

    const gatekeepScript = `
    local phaseEnd = redis.call('HGET', KEYS[1], 'phaseEndAt')
    local currentPhase = redis.call('HGET', KEYS[1], 'phase')
    if tonumber(phaseEnd) <= tonumber(ARGV[1]) and currentPhase ~= 'resolving' then
        redis.call('HSET', KEYS[1], 'phase', 'resolving')
        return true
    else
        return false
    end
    `;

    const isResolver = await redis.eval(gatekeepScript, [key], [currentTime]);
    let updatedState = {};
    if (isResolver) {
        console.log("CALCULATING SOMETHING")
        updatedState = {
            phase: ["night", "day"],
            phaseEndAt: Date.now() + configuredDuration,
        };
    };

    const script = `
    local userId = ARGV[1]
    local key = KEYS[1]
    local activePlayersIdsKey = key .. ':activePlayersIds'
    local updatedState = cjson.decode(ARGV[2])

    if next(updatedState) ~= nil then
        local roundCount = redis.call('HGET', key, 'round')

        redis.call('HSET', key,
            'phase', updatedState.phase[((roundCount + 1) % #updatedState.phase) + 1],
            'phaseEndAt', updatedState.phaseEndAt,
            'round', roundCount + 1
        )
    end

    local playerIds = redis.call('SMEMBERS', activePlayersIdsKey)
    local gameStateFields = {
        'phase',
        'phaseEndAt',
        'round',
    }

    for i = 1, #playerIds, 1 do
        if playerIds[i] == userId then
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':name')
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':role')
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':status')
        else
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':name')
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':status')
        end
    end
    
    local value = redis.call('HMGET', key, unpack(gameStateFields))
    local gameData = {}

    for i, field in ipairs(gameStateFields) do
        gameData[field] = value[i]
    end

    return {cjson.encode(gameData), playerIds}
    `
    const [gameData, activePlayersIds] = await redis.eval(script, [key], [userId, updatedState]) as [RedisGameRoom, string[]];

    if (!gameData) {
        return { gameState: null, activePlayersIds };
    }

    const gameState = {
        user: {
            id: String(userId),
            name: String(gameData[`p:${userId}:name`]),
            role: String(gameData[`p:${userId}:role`]),
            status: String(gameData[`p:${userId}:status`]),
        },
        players: activePlayersIds
            .filter((id) => id !== userId)
            .map((id) => {
                const name = String(gameData[`p:${id}:name`]);
                const role = 'unknown';
                const status = String(gameData[`p:${id}:status`]);

                return {
                    name,
                    role,
                    status,
                    id: String(id),
                }
            }),
        phase: gameData.phase,
        phaseEndAt: Number(gameData.phaseEndAt - Date.now()),
        round: gameData.round,
    }

    return { gameState, activePlayersIds };
}