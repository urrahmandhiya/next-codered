"use server";

import { Redis } from "@upstash/redis";
import { GameRoomMetaData, RedisGameRoom } from "../definitions";

const redis = Redis.fromEnv();

export async function gatekeepResolver(
    key: string, currentTime: number):
    Promise<[boolean, Omit<GameRoomMetaData, 'lastDeadPlayerId' | 'voterByCandidate'>]> {
    const gatekeepScript = `
    local gameStateFields = {
        'phase',
        'discussDuration',
        'voteDuration',
        'round',
        'phaseEndAt',
        'badSide',
        'goodSide',
        'endGame',
        'resolvingEndAt',
    }

    local value = redis.call('HMGET', KEYS[1], unpack(gameStateFields))
    local data = {}

    for i, field in ipairs(gameStateFields) do
        data[field] = value[i]
    end

    local isResolver = false
    local currentTime = tonumber(ARGV[1])

    if data.endGame == 'inProgress'
        and tonumber(data.phaseEndAt) <= currentTime 
        and tonumber(data.resolvingEndAt) <= currentTime then
        local resolvingDuration = currentTime + 5000
        redis.call('HSET', KEYS[1], 'resolvingEndAt', resolvingDuration)
        isResolver = true
        data.resolvingEndAt = tonumber(resolvingDuration)
    end

    return {isResolver, cjson.encode(data)}
    `;

    const [isResolver, data] = await redis.eval(gatekeepScript, [key], [currentTime]) as [boolean, Omit<GameRoomMetaData, 'lastDeadPlayerId' | 'voterByCandidate'>];
    return [isResolver, data];
}


export async function getVotingData(key: string): Promise<[Record<string, string>, string[]]> {
    const voteScript = `
    local activePlayersIdsKey = KEYS[1] .. ':activePlayersIds'
    local playerIds = redis.call('SMEMBERS', activePlayersIdsKey)
    local voteFields = {}

    for i = 1, #playerIds, 1 do
        table.insert(voteFields, 'p:' .. playerIds[i] .. ':vote')
    end

    local votedIds = redis.call('HMGET', KEYS[1], unpack(voteFields))
    local voterData = {}

    for i, field in ipairs(voteFields) do
        voterData[field] = votedIds[i]
    end 

    -- clean the vote fields for next voting
    redis.call('HDEL', KEYS[1], unpack(voteFields))
    return {cjson.encode(voterData), votedIds}
    `;

    const [voterData, votedIds] = await redis.eval(voteScript, [key], []) as [Record<string, string>, string[]];
    return [voterData, votedIds]
}

export async function writebackResolver(key: string, userId: string, updatedState: Record<string, string | number>) {
    const writebackScript = `
    local userId = ARGV[1]
    local key = KEYS[1]
    local activePlayersIdsKey = key .. ':activePlayersIds'
    local deadPlayersIdsKey = key .. ':deadPlayersIds'
    local updatedState = cjson.decode(ARGV[2])

    -- if resolver is too long and someone has took over, abort the writeback
    if next(updatedState) ~= nil
        and tostring(updatedState.resolvingToken) ~= redis.call('HGET', key, 'resolvingEndAt') then
        return
    end 

    -- check if its a phase transitioning poll
    if next(updatedState) ~= nil then
        local roundCount = redis.call('HGET', key, 'round')

        -- if vote result is not tied or none
        if updatedState.votedPlayerId ~= "none" then
            -- execute the voted player
            local votedPlayerStatus = 'p:' .. updatedState.votedPlayerId .. ':status'
            local deadPlayerId = updatedState.votedPlayerId
            redis.call('HSET', key, 
                votedPlayerStatus, 'dead', 
                'lastDeadPlayerId', updatedState.votedPlayerId
            )
            redis.call('SADD', deadPlayersIdsKey, deadPlayerId)

            -- and reduce its side amount
            local deadPlayerSide = 'p:' .. deadPlayerId .. ':side'
            local decreasedSide = redis.call('HGET', key, deadPlayerSide)
            redis.call('HINCRBY', key, decreasedSide .. 'Side', -1)
        end

        -- clean lastDeadPlayerId after count phases
        if updatedState.phase == 'day' or updatedState.phase == 'night' then
            redis.call('HSET', key, 
                'lastDeadPlayerId', "none", 
                'voterByCandidate', "{}"
            )
        end

        redis.call('HSET', key,
            'phase', updatedState.phase,
            'phaseEndAt', updatedState.phaseEndAt,
            'round', updatedState.round,
            'voterByCandidate', updatedState.voterByCandidate,
            'endGame', updatedState.endGame
        )
    end
    `;

    await redis.eval(writebackScript, [key], [userId, updatedState]);
}

export async function gameRoomPoll(key: string, userId: string): Promise<[RedisGameRoom, string[]]> {
    const pollScript = `
    local userId = ARGV[1]
    local key = KEYS[1]
    local activePlayersIdsKey = key .. ':activePlayersIds'
    local deadPlayersIdsKey = key .. ':deadPlayersIds'

    local playerIds = redis.call('SMEMBERS', activePlayersIdsKey)
    local endGame = redis.call('HGET', key, 'endGame')
    local playerSide = redis.call('HGET', key, 'p:' .. userId .. ':side')
    local gameStateFields = {
        'phase',
        'phaseEndAt',
        'round',
        'lastDeadPlayerId',
        'voterByCandidate',
        'endGame', 
    }

    -- assigning side to each player
    -- so bad sides can see each other
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

    local deadPlayersIds = redis.call('SMEMBERS', deadPlayersIdsKey)
    local deadPlayersIdsSet = {}

    for _, id in ipairs(deadPlayersIds) do
        deadPlayersIdsSet[id] = true
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

            if (playerSide == 'bad' and sides[playerIds[i]] == 'bad') 
                or (deadPlayersIdsSet[playerIds[i]]) 
                or (endGame ~= 'inProgress') then
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
    `;

    const [gameData, activePlayersIds] = await redis.eval(pollScript, [key], [userId]) as [RedisGameRoom, string[]];
    return [gameData, activePlayersIds]
}
