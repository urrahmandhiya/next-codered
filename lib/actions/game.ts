"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { DynamicFields, GameRoomMetaData, GameState, RedisGameRoom } from "../definitions";

const redis = Redis.fromEnv();

export async function getGameState(roomCode: string): Promise<{ gameState: GameState | null; activePlayersIds: string[] }> {
    const userId = (await cookies()).get("user_id")?.value;
    const key = `room:${roomCode}`;
    const currentTime = Date.now();

    const gatekeepScript = `
    local gameStateFields = {
        'phase',
        'phaseDuration',
        'round',
        'phaseEndAt',
    }

    local value = redis.call('HMGET', KEYS[1], unpack(gameStateFields))
    local data = {}

    for i, field in ipairs(gameStateFields) do
        data[field] = value[i]
    end

    local isResolver = false

    if tonumber(data.phaseEndAt) <= tonumber(ARGV[1]) and data.phase ~= 'resolving' then
        redis.call('HSET', KEYS[1], 'phase', 'resolving')
        isResolver = true
    end

    return {isResolver, cjson.encode(data)}
    `;

    const [isResolver, data] = await redis.eval(gatekeepScript, [key], [currentTime]) as [boolean, GameRoomMetaData];
    let updatedState = {};
    if (isResolver) {
        console.log("CALCULATING SOMETHING")
        const ROUND_0_PHASE = {
            starting: "night",
            night: "day",
            day: "hangVote",
            hangVote: "night",
        }
        const ROUND_1_PHASE = {
            night: "killVote",
            killVote: "day",
            day: "hangVote",
            hangVote: "night",
        }
        const phaseState: DynamicFields = data.round > 0 ? ROUND_1_PHASE : ROUND_0_PHASE;
        const nextPhase = phaseState[data.phase];
        const isNextRound = nextPhase === "day";

        updatedState = {
            phase: nextPhase,
            phaseEndAt: Date.now() + (data.phaseDuration * 1000),
            round: isNextRound ? Number(data.round) + 1 : Number(data.round), 
        };
    };

    const script = `
    local userId = ARGV[1]
    local key = KEYS[1]
    local activePlayersIdsKey = key .. ':activePlayersIds'
    local updatedState = cjson.decode(ARGV[2])

    if next(updatedState) ~= nil then
        local roundCount = redis.call('HGET', key, 'round')
        local currentPhase = redis.call('HGET', key, 'phase')

        redis.call('HSET', key,
            'phase', updatedState.phase,
            'phaseEndAt', updatedState.phaseEndAt,
            'round', updatedState.round
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