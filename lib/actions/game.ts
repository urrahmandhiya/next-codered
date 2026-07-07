"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { ActionResponse, GameState } from "../definitions";
import { mapVoterByCandidatesToNames, phaseTransition, tallyingVotes, winningCondition } from "../pure/game";
import { gameRoomPoll, gatekeepResolver, getVotingData, writebackResolver } from "../redis-lua/game";

const redis = Redis.fromEnv();

export async function getGameState(roomCode: string): Promise<{ gameState: GameState | null; activePlayersIds: string[] }> {
    const upperCode = roomCode.toUpperCase();
    try {
        const userId = (await cookies()).get("user_id")?.value;
        if (!userId) throw new Error("can't get user_id from cookies");

        const key = `room:${upperCode}`;
        const currentTime = Date.now();

        const [isResolver, data] = await gatekeepResolver(key, currentTime);
        let updatedState = {};

        if (isResolver && data.endGame === "inProgress") {
            const { nextPhase, phaseEndAtDuration } = phaseTransition(data);

            const isNextRound = nextPhase === "day";
            const isVoting = data.phase.endsWith("Vote");

            let votedPlayerIds: string[] = [];
            let voterByCandidate: Record<string, string[]> = {};

            if (isVoting) {
                const [voterData, votedIds] = await getVotingData(key);
                ({ votedPlayerIds, voterByCandidate } = tallyingVotes(voterData, votedIds));
            }

            const endGame = winningCondition(data, nextPhase);

            updatedState = {
                phase: nextPhase,
                phaseEndAt: Date.now() + (Number(phaseEndAtDuration) * 1000),
                round: isNextRound ? Number(data.round) + 1 : Number(data.round),
                votedPlayerId: (isVoting && votedPlayerIds.length === 1) ? votedPlayerIds[0] : "none",
                voterByCandidate: JSON.stringify(voterByCandidate),
                endGame: endGame,
                resolvingToken: data.resolvingEndAt,
            };

            await writebackResolver(key, userId, updatedState);
        };

        const [gameData, activePlayersIds] = await gameRoomPoll(key, userId);

        if (!gameData) {
            return { gameState: null, activePlayersIds };
        }

        console.log("[lastDeadPlayerId]", gameData.lastDeadPlayerId)
        const validVoterByCandidate = mapVoterByCandidatesToNames(gameData);

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
            lastDeadPlayerId: gameData.lastDeadPlayerId === "none" ? "none" : gameData.lastDeadPlayerId,
            voterByCandidate: Object.keys(validVoterByCandidate).length ? validVoterByCandidate : {},
            endGame: gameData.endGame,
        }

        return { gameState, activePlayersIds };
    } catch (error) {
        console.error(`[getGameState] Error for room ${upperCode}:`, error);
        throw error;
    }
}

export async function getPlayerVote(roomCode: string, voteId: string): Promise<ActionResponse> {
    const upperCode = roomCode.toUpperCase();
    const userId = (await cookies()).get("user_id")?.value;
    const key = `room:${upperCode}`;
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