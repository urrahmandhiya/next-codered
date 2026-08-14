"use server";

import { GameRoomMetaData, RedisGameRoom } from "@/lib/definitions";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function gatekeepResolver(
    key: string, currentTime: number):
    Promise<[boolean, Omit<GameRoomMetaData, 'lastDeadPlayerId' | 'voterByCandidateJson'>]> {
    const gatekeepScript = `
    local gameStateFields = {
        'phase',
        'discussDuration',
        'voteDuration',
        'round',
        'phaseEndAt',
        'resolvingEndAt',
        'badSide',
        'goodSide',
        'endGame',
    }

    local numberFieldSet = {
        ['discussDuration'] = true,
        ['voteDuration'] = true,
        ['round'] = true,
        ['phaseEndAt'] = true,
        ['resolvingEndAt'] = true,
        ['goodSide'] = true,
        ['badSide'] = true,
    }

    local value = redis.call('HMGET', KEYS[1], unpack(gameStateFields))
    local data = {}

    for i, field in ipairs(gameStateFields) do
        if numberFieldSet[field] then
            data[field] = tonumber(value[i])
        else
            data[field] = value[i]
        end
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

    const [isResolver, data] = await redis.eval(gatekeepScript, [key], [currentTime]) as [boolean, Omit<GameRoomMetaData, 'lastDeadPlayerId' | 'voterByCandidateJson'>];
    return [isResolver, data];
}


export async function getVotingData(key: string): Promise<[Record<string, string>, string[], Record<string, number>]> {
    const voteScript = `
    local activePlayersIdsKey = KEYS[1] .. ':activePlayersIds'
    local playerIds = redis.call('SMEMBERS', activePlayersIdsKey)
    local phase = redis.call('HGET', KEYS[1], 'phase')
    local voteFields = {}
    local inactivityFields = {}

    for i = 1, #playerIds, 1 do
        table.insert(voteFields, 'p:' .. playerIds[i] .. ':vote')
        table.insert(inactivityFields, 'p:' .. playerIds[i] .. ':inactivity')
    end

    local votedValue = redis.call('HMGET', KEYS[1], unpack(voteFields))
    local votedIds = {}
    local voterData = {}

    local inactivityUpdate = {}

    for i, field in ipairs(voteFields) do
        if votedValue[i] then
            voterData[field] = votedValue[i]
            table.insert(votedIds, votedValue[i])
        end

        -- increment inactivity counter if player vote not voting on hangVote
        -- and reset to 0 if vote on another player
        if (phase == 'hangVote') then
            if votedValue[i] == 'none' then
                local current = redis.call('HGET', KEYS[1], inactivityFields[i])
                table.insert(inactivityUpdate, inactivityFields[i])
                table.insert(inactivityUpdate, (tonumber(current) + 1))
            else
                table.insert(inactivityUpdate, inactivityFields[i])
                table.insert(inactivityUpdate, 0)
            end
        end
    end 

    local inactivityData = {}

    if next(inactivityUpdate) ~= nil then
        redis.call('HSET', KEYS[1], unpack(inactivityUpdate))

        local inactivityValue = redis.call('HMGET', KEYS[1], unpack(inactivityFields))

        for i, field in ipairs(inactivityFields) do
            if inactivityValue[i] then
                inactivityData[field] = inactivityValue[i]
            end
        end
    end

    -- clean the vote fields for next voting
    redis.call('HDEL', KEYS[1], unpack(voteFields))
    return { cjson.encode(voterData), votedIds, cjson.encode(inactivityData) }
    `;

    const [voterData, votedIds, inactivityData] = await redis.eval(voteScript, [key], []) as [Record<string, string>, string[], Record<string, number>];
    return [voterData, votedIds, inactivityData]
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
            local deadPlayerId = updatedState.votedPlayerId
            local deadPlayerStatus = 'p:' .. deadPlayerId .. ':status'
            redis.call('HSET', key, 
                deadPlayerStatus, 'dead', 
                'lastDeadPlayerId', deadPlayerId
            )
            redis.call('SADD', deadPlayersIdsKey, deadPlayerId)

            -- and reduce its side amount
            local deadPlayerSide = 'p:' .. deadPlayerId .. ':side'
            local decreasedSide = redis.call('HGET', key, deadPlayerSide)
            redis.call('HINCRBY', key, decreasedSide .. 'Side', -1)
        end

        -- clean lastDeadPlayerId after count phases
        if updatedState.phase == 'uptime' or updatedState.phase == 'downtime' then
            redis.call('HSET', key, 
                'lastDeadPlayerId', "none", 
                'voterByCandidateJson', "{}"
            )
        end

        redis.call('HSET', key,
            'phase', updatedState.phase,
            'phaseEndAt', updatedState.phaseEndAt,
            'round', updatedState.round,
            'voterByCandidateJson', updatedState.voterByCandidateJson,
            'endGame', updatedState.endGame
        )

        -- reset each TTL keys (room hash, activeId set, deadId set)
        redis.call('EXPIRE', key, (tonumber(updatedState.phaseEndAtDuration) + 120))
        redis.call('EXPIRE', activePlayersIdsKey, (tonumber(updatedState.phaseEndAtDuration) + 120))
        redis.call('EXPIRE', deadPlayersIdsKey, (tonumber(updatedState.phaseEndAtDuration) + 120))
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
        'voterByCandidateJson',
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
