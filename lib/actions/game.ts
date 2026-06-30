"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { ActionResponse, DynamicFields, GameRoomMetaData, GameState, RedisGameRoom } from "../definitions";

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
        'badSide',
        'goodSide',
        'endGame',
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

    const [isResolver, data] = await redis.eval(gatekeepScript, [key], [currentTime]) as [boolean, Omit<GameRoomMetaData, 'lastDeadPlayerId' | 'voterByCandidate'>];
    let updatedState = {};

    // still prone to deadlock (resolver failed to update and writeback) 
    // implement resolver duration (timelimit) to prevent deadlock later
    if (isResolver && data.endGame === "inProgress") {
        console.log("CALCULATING SOMETHING")
        const ROUND_0_PHASE = {
            starting: "night",
            night: "day",
            day: "hangVote",
            hangVote: "hangVoteCount",
            hangVoteCount: "hangVoteResult",
            hangVoteResult: "night",
        }
        const ROUND_1_PHASE = {
            night: "killVote",
            killVote: "killVoteCount",
            killVoteCount: "killVoteResult",
            killVoteResult: "day",
            day: "hangVote",
            hangVote: "hangVoteCount",
            hangVoteCount: "hangVoteResult",
            hangVoteResult: "night",
        }
        const phaseState: DynamicFields = data.round > 0 ? ROUND_1_PHASE : ROUND_0_PHASE;
        const nextPhase = String(phaseState[data.phase]);
        const isNextRound = nextPhase === "day";

        const nextPhaseWords = nextPhase.split(/(?=[A-Z])/);
        const phaseType = nextPhaseWords[nextPhaseWords.length - 1];

        const isVoting = data.phase.endsWith("Vote");
        let phaseEndAtDuration: number;

        switch (phaseType) {
            case "Vote":
                phaseEndAtDuration = data.voteDuration;
                break;
            case "Count":
                phaseEndAtDuration = 5;
                break;
            case "Result":
                phaseEndAtDuration = 5;
                break;
            default:
                phaseEndAtDuration = data.discussDuration;
                break;
        }
        console.log("[Current Phase] ", nextPhase);
        console.log("[Duration] ", phaseEndAtDuration);

        let votedPlayerIds: string[] = [];
        const voterByCandidate: Record<string, string[]> = {};

        if (isVoting) {
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
            `

            const [voterData, votedIds] = await redis.eval(voteScript, [key], []) as [Record<string, string>, string[]];
            const cleanVotedIds = votedIds.filter((id) => id !== "null" && id !== null);
            console.log("[VoterData]", voterData)
            const cleanVoterData = Object.entries(voterData).filter(([key, val]) => key && val);
            console.log("[cleanVoterData]", cleanVoterData)

            let maxCount = 0;
            const occ: Record<string, number> = {};

            for (const id of cleanVotedIds) {
                occ[id] = (occ[id] || 0) + 1;
            }

            for (const key in occ) {
                if (occ[key] > maxCount) {
                    maxCount = occ[key];
                    votedPlayerIds = [key];
                } else if (occ[key] === maxCount) {
                    votedPlayerIds.push(key);
                }
            }
            console.log("[Voted Ids]", votedPlayerIds)

            cleanVoterData.forEach(([key, val]) => {
                if (voterByCandidate[val]) {
                    voterByCandidate[val].push(key);
                } else {
                    voterByCandidate[val] = [key];
                }
            })
        }

        let endGame = "inProgress";
        const isGoodWon = Number(data.badSide) === 0;
        const isBadWon = Number(data.goodSide) === 0;
        const isGameEnd = (isBadWon || isGoodWon) && (nextPhase === "night" || nextPhase === "day");

        if (isGameEnd) {
            if (isGoodWon) endGame = "goodEnd";
            if (isBadWon) endGame = "badEnd";
        }
        console.log("[Game End]", isGameEnd)
        console.log("[Good Side]", data.goodSide, isGoodWon)
        console.log("[Bad Side]", data.badSide, isBadWon)

        updatedState = {
            phase: nextPhase,
            phaseEndAt: Date.now() + (phaseEndAtDuration * 1000),
            round: isNextRound ? Number(data.round) + 1 : Number(data.round),
            votedPlayerId: (isVoting && votedPlayerIds.length === 1) ? votedPlayerIds[0] : "none",
            voterByCandidate: JSON.stringify(voterByCandidate),
            endGame: endGame,
        };
    };

    const script = `
    local userId = ARGV[1]
    local key = KEYS[1]
    local activePlayersIdsKey = key .. ':activePlayersIds'
    local deadPlayersIdsKey = key .. ':deadPlayersIds'
    local updatedState = cjson.decode(ARGV[2])

    -- check if its a phase transitioning poll
    if next(updatedState) ~= nil then
        local roundCount = redis.call('HGET', key, 'round')
        local currentPhase = redis.call('HGET', key, 'phase')

        -- if vote result is not tied or none
        if updatedState.votedPlayerId ~= "none" then
            -- execute the voted player
            local votedPlayerStatus = 'p:' .. updatedState.votedPlayerId .. ':status'
            local deadPlayerId = updatedState.votedPlayerId
            redis.call('HSET', key, votedPlayerStatus, 'dead', 'lastDeadPlayerId', updatedState.votedPlayerId)
            redis.call('SADD', deadPlayersIdsKey, deadPlayerId)

            -- and reduce its side amount
            local deadPlayerSide = 'p:' .. deadPlayerId .. ':side'
            local decreasedSide = redis.call('HGET', key, deadPlayerSide)
            redis.call('HINCRBY', key, decreasedSide .. 'Side', -1)
        end

        -- clean lastDeadPlayerId after count phases
        if updatedState.phase == 'day' or updatedState.phase == 'night' then
            redis.call('HSET', key, 'lastDeadPlayerId', "none")
            redis.call('HSET', key, 'voterByCandidate', "{}")
        end

        redis.call('HSET', key,
            'phase', updatedState.phase,
            'phaseEndAt', updatedState.phaseEndAt,
            'round', updatedState.round,
            'voterByCandidate', updatedState.voterByCandidate,
            'endGame', updatedState.endGame
        )
    end

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
    `
    const [gameData, activePlayersIds] = await redis.eval(script, [key], [userId, updatedState]) as [RedisGameRoom, string[]];

    if (!gameData) {
        return { gameState: null, activePlayersIds };
    }

    const lastDeadPlayerId = gameData.lastDeadPlayerId;
    console.log("[lastDeadPlayerId]", lastDeadPlayerId)

    const parsedVoterByCandidate = JSON.parse(gameData.voterByCandidate) as Record<string, string[]>;
    const entriesVoterByCandidate = Object.entries(parsedVoterByCandidate);

    const validVoterByCandidate: Record<string, string[]> = entriesVoterByCandidate.length
        ? Object.fromEntries(
            entriesVoterByCandidate.map(([voted, voters]) => [
                voted === "none" ? "none" : gameData[`p:${voted}:name`],
                voters.map((voter) => String(gameData[voter.replace(':vote', ':name')]))
            ])
        )
        : {};

    console.log("[voterByCandidate]", validVoterByCandidate)

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

                // bad sides can see each other and dead players are revealed
                if (gameData[`p:${id}:role`] && gameData[`p:${id}:side`]) {
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
        lastDeadPlayerId: lastDeadPlayerId === "none" ? "none" : lastDeadPlayerId,
        voterByCandidate: Object.keys(validVoterByCandidate).length ? validVoterByCandidate : {},
        endGame: gameData.endGame,
    }

    return { gameState, activePlayersIds };
}

export async function getPlayerVote(roomCode: string, voteId: string): Promise<ActionResponse> {
    const userId = (await cookies()).get("user_id")?.value;
    const key = `room:${roomCode}`;
    console.log("[Vote Id Sent]", voteId)

    try {
        await redis.hset(key, { [`p:${userId}:vote`]: voteId })
        return { success: true, message: "getting player vote..." };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: String(error) };
    }
}