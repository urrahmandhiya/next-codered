"use server";

import { Redis } from "@upstash/redis";
import { Lock } from "@upstash/lock";
import { ActionResponse, DynamicFields } from "@/lib/definitions";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const redis = Redis.fromEnv();
const MINIMAL_CURRENTPLAYERS = 4;
const CURRENT_ROLES = ["hacker", "user"];
const ROLES_SIDES: DynamicFields = {
    hacker: "bad",
    user: "good",
}

export async function startGame(roomCode: string): Promise<ActionResponse> {
    const upperCode = roomCode.toUpperCase();
    const key = `room:${upperCode}`;
    const activePlayersIdsKey = `${key}:activePlayersIds`;
    const lock = new Lock({
        id: `lock:${key}`,
        redis,
        lease: 5000,
    });

    let isLockAcquired = false;
    try {
        isLockAcquired = await lock.acquire();
        if (!isLockAcquired) {
            return { success: false, error: "Unable to start game due to high traffic. Try again." };
        }

        const rolesFields = CURRENT_ROLES.map((role) => `r:${role}`);
        const roomData = await redis.hmget(key, "playersInRoom", "roomStatus", ...rolesFields) as Record<string, string> | null;

        if (!roomData) {
            throw new Error("Room not found");
        }

        const playersInRoom = Number(roomData.playersInRoom || 0);
        if (playersInRoom < MINIMAL_CURRENTPLAYERS) {
            throw new Error(`Insufficient players. Minimal number of players to start the game is ${MINIMAL_CURRENTPLAYERS}`);
        }

        if (roomData["r:hacker"] === undefined || roomData["r:hacker"] === null) {
            throw new Error("Roles amount is not configured. Ask the host to configure it");
        }

        let totalRoles = 0;
        for (const roleField of rolesFields) {
            totalRoles += Number(roomData[roleField] || 0);
        }

        if (playersInRoom !== totalRoles) {
            throw new Error("Number of players and total roles are mismatched. Ask the host to configure it");
        }

        const playersIds = await redis.smembers(activePlayersIdsKey);
        if (!playersIds || playersIds.length === 0) {
            throw new Error("No players in the room");
        }

        const shuffledPlayers = [...playersIds];
        for (let i = shuffledPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
        }

        const initialGameState: Record<string, string | number> = {
            roomStatus: "playing",
            round: 0,
            lastDeadPlayerId: "none",
            goodSide: 0,
            badSide: 0,
            endGame: "inProgress",

            // starting phase just to wait/ensure every players polls to the game room
            phase: "starting",
            phaseEndAt: Date.now() + (15 * 1000),
            resolvingEndAt: 0,
        };

        let playerIdx = 0;
        for (const role of CURRENT_ROLES) {
            const amount = Number(roomData[`r:${role}`] || 0);
            for (let i = 0; i < amount; i++) {
                if (playerIdx < shuffledPlayers.length) {
                    initialGameState[`p:${shuffledPlayers[playerIdx]}:role`] = role;
                    initialGameState[`p:${shuffledPlayers[playerIdx]}:status`] = "alive";
                    initialGameState[`p:${shuffledPlayers[playerIdx]}:side`] = ROLES_SIDES[role];

                    if (ROLES_SIDES[role] === "bad") {
                        initialGameState.badSide = Number(initialGameState.badSide) + 1;
                    }

                    if (ROLES_SIDES[role] === "good") {
                        initialGameState.goodSide = Number(initialGameState.goodSide) + 1;
                    }
                    playerIdx++;
                }
            }
        }

        await redis.hset(key, initialGameState);
        return { success: true, message: "playing" };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: String(error) };
    } finally {
        if (isLockAcquired) {
            await lock.release();
        }
    }
}

export async function updateRoomSettings(roomCode: string, _prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const upperCode = roomCode.toUpperCase();
    const key = `room:${upperCode}`;
    const playerCapacity = Number(formData.get("player-cap") || 0);
    const discussDuration = Number(formData.get("discuss-duration") || 0);
    const voteDuration = Number(formData.get("vote-duration") || 0);

    const lock = new Lock({
        id: `lock:${key}`,
        redis,
        lease: 5000,
    });

    let isLockAcquired = false;
    try {
        isLockAcquired = await lock.acquire();
        if (!isLockAcquired) {
            return { success: false, error: "Unable to update room settings due to high traffic. Try again." };
        }

        const roomData = await redis.hmget(key, "playersInRoom", "roomStatus") as Record<string, string> | null;
        if (!roomData) {
            throw new Error("Room not found");
        }

        const playersInRoom = Number(roomData.playersInRoom || 0);
        const roomStatus = String(roomData.roomStatus);

        if (roomStatus !== "waiting") {
            throw new Error("Game is starting, unable to change room settings now");
        }

        if (playerCapacity < playersInRoom) {
            throw new Error("Number of players in room exceeds new capacity");
        }

        const updates: Record<string, number> = {
            maxPlayersInRoom: playerCapacity,
            discussDuration: discussDuration,
            voteDuration: voteDuration,
        };

        for (const role of CURRENT_ROLES) {
            const amount = Number(formData.get(`${role}-amount`) || 0);
            updates[`r:${role}`] = amount;
        }

        await redis.hset(key, updates);
        revalidatePath(`/room/${upperCode}`);
        return { success: true, message: "Room settings changed" };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: String(error) };
    } finally {
        if (isLockAcquired) {
            await lock.release();
        }
    }
}

export async function deletePlayer(roomCode: string, id: string): Promise<ActionResponse> {
    const upperCode = roomCode.toUpperCase();
    const key = `room:${upperCode}`;
    const activePlayersIdsKey = `${key}:activePlayersIds`;

    const lock = new Lock({
        id: `lock:${key}`,
        redis,
        lease: 5000,
    });

    let isLockAcquired = false;
    try {
        isLockAcquired = await lock.acquire();
        if (!isLockAcquired) {
            return { success: false, error: "Unable to delete player due to high traffic. Try again." };
        }

        const roomData = await redis.hmget(key, "playersInRoom", "roomStatus", "roomHostId", `p:${id}:name`);
        if (!roomData) {
            throw new Error("Room not found");
        }

        const playersInRoom = Number(roomData.playersInRoom);
        const roomStatus = String(roomData.roomStatus);
        const roomHostId = String(roomData.roomHostId);
        const deletedPlayerName = String(roomData[`p:${id}:name`]);

        if (roomStatus !== "waiting") {
            throw new Error("Game is starting, cannot delete a player");
        }

        const deletedFieldsCount = await redis.hdel(key, `p:${id}:name`, `p:${id}:createdAt`, `p:${id}:lastSeen`, `p:${id}:role`);

        if (deletedFieldsCount >= 2) {
            const newCurrentPlayer = playersInRoom - 1;
            const pipeline = redis.pipeline();

            if (newCurrentPlayer <= 0) {
                // Room is empty, delete it entirely
                pipeline.del(key);
                pipeline.del(activePlayersIdsKey);
                await pipeline.exec();

                revalidatePath(`/room/${upperCode}`);
                return { success: true, message: `Room deleted as the last player left` };
            }

            // Room still has players
            pipeline.hset(key, { playersInRoom: newCurrentPlayer });
            pipeline.srem(activePlayersIdsKey, id);

            if (id === roomHostId) {
                // Host left, promote the oldest remaining player
                const remainingIds = (await redis.smembers(activePlayersIdsKey)).filter(pId => pId !== id);
                if (remainingIds.length > 0) {
                    const fieldsToGet = remainingIds.map(pId => `p:${pId}:createdAt`);
                    const createdTimes = await redis.hmget(key, ...fieldsToGet) as Record<string, string>;

                    let nextHostId = remainingIds[0];
                    let minCreatedAt = Infinity;

                    remainingIds.forEach((pId) => {
                        const fieldName = `p:${pId}:createdAt`;
                        const cTime = Number(createdTimes[fieldName] || Infinity);
                        if (cTime < minCreatedAt) {
                            minCreatedAt = cTime;
                            nextHostId = pId;
                        }
                    });

                    pipeline.hset(key, { roomHostId: nextHostId });
                }
            }

            await pipeline.exec();

            revalidatePath(`/room/${upperCode}`);
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
        if (isLockAcquired) {
            await lock.release();
        }
    }
}

export async function updatePlayerName(roomCode: string, _prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const upperCode = roomCode.toUpperCase();
    const userId = (await cookies()).get("user_id")?.value;
    const username = formData.get("username");
    const key = `room:${upperCode}`;
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


export async function abortWaitingRoom(roomCode: string): Promise<ActionResponse> {
    const upperCode = roomCode.toUpperCase();
    const key = `room:${upperCode}`;

    const lock = new Lock({
        id: `lock:${key}`,
        redis,
        lease: 5000,
    });

    let isLockAcquired = false;
    try {
        isLockAcquired = await lock.acquire();
        if (!isLockAcquired) {
            return { success: false, error: "Unable to start game due to high traffic. Try again." };
        }

        const roomStatus = await redis.hget(key, "roomStatus");

        if (!roomStatus) {
            throw new Error("Room status not found.");
        }

        if (roomStatus !== "waiting") {
            throw new Error("Game is starting, room can not be aborted.");
        }

        await redis.hset(key, { roomStatus: "aborted" });

        return { success: true, message: "aborting waiting room" }
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: String(error) }
    } finally {
        if (isLockAcquired) {
            await lock.release();
        }
    }
}
