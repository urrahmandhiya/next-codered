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
        'discussDuration',
        'voteDuration',
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

    // still prone to deadlock (resolver failed to update and writeback) // implement resolver duration (timelimit) to prevent deadlock later
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
        const nextPhase = String(phaseState[data.phase]);
        const isNextRound = nextPhase === "day";

        updatedState = {
            phase: nextPhase,
            phaseEndAt: Date.now() + ((nextPhase.endsWith("Vote") ? data.voteDuration : data.discussDuration) * 1000),
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
    local playerSide = redis.call('HGET', key, 'p:' .. userId .. ':side')
    local gameStateFields = {
        'phase',
        'phaseEndAt',
        'round',
    }
    
    local sideFields = {}
    local otherPlayerIds = {}
    
    for i = 1, #playerIds, 1 do
        if playerIds[i] ~= userId then
            table.insert(otherPlayerIds, playerIds[i])
            table.insert(sideFields, 'p:' .. playerIds[i] .. ':side')
        end
    end
        
    local sideValue = redis.call('HMGET', key, unpack(sideFields))
    local sides = {}

    for i, id in ipairs(otherPlayerIds) do
        sides[id] = sideValue[i]
    end

    for i = 1, #playerIds, 1 do
        if playerIds[i] == userId then
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':name')
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':role')
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':status')
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':side')
        else
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':name')
            table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':status')

            if playerSide == 'bad' and sides[playerIds[i]] == 'bad' then
                table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':side')
                table.insert(gameStateFields, 'p:' .. playerIds[i] .. ':role')
            end
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

    const userSide = gameData[`p:${userId}:side`];

    const gameState = {
        user: {
            id: String(userId),
            name: String(gameData[`p:${userId}:name`]),
            role: String(gameData[`p:${userId}:role`]),
            status: String(gameData[`p:${userId}:status`]),
            side: String(gameData[`p:${userId}:side`]),
        },
        players: activePlayersIds
            .filter((id) => id !== userId)
            .map((id) => {
                const name = String(gameData[`p:${id}:name`]);
                const status = String(gameData[`p:${id}:status`]);
                let role = 'unknown';
                let side = 'unknown';

                if (userSide === 'bad' && gameData[`p:${id}:side`] === 'bad') {
                    role = String(gameData[`p:${id}:role`]);
                    side = String(gameData[`p:${id}:side`]);
                }

                return {
                    name,
                    role,
                    status,
                    id: String(id),
                    side,
                }
            }),
        phase: gameData.phase,
        phaseEndAt: Number(gameData.phaseEndAt),
        round: gameData.round,
    }

    return { gameState, activePlayersIds };
}