import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { RedisRoom, Role, Room } from "@/lib/definitions";
import { deletePlayer } from "@/lib/actions/room";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();
const CURRENT_ROLES = ["hacker", "user"];
const rolesFallback = CURRENT_ROLES.map((role) => ({ name: role, amount: 1 }));

export async function getRoomState(roomCode: string): Promise<{ room: Room | null; userId: string | undefined }> {
    const upperCode = roomCode.toUpperCase();
    try {
        const userId = (await cookies()).get("user_id")?.value;
        if (!userId) throw new Error("can't get user_id from cookies");

        const p = redis.pipeline();

        p.hgetall(`room:${upperCode}`);
        p.smembers(`room:${upperCode}:activePlayersIds`);

        const [roomData, activePlayersIds] = await p.exec<[RedisRoom, string[]]>();

        if (!roomData) {
            return { room: null, userId };
        }

        const actualPlayersCount = activePlayersIds ? activePlayersIds.length : 0;
        if (Number(roomData.playersInRoom || 0) !== actualPlayersCount) {
            await redis.hset(`room:${upperCode}`, { playersInRoom: actualPlayersCount });
            roomData.playersInRoom = actualPlayersCount;
        }

        let roles: Role[] = [];

        if (Object.hasOwn(roomData, "r:hacker")) {
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
            discussDuration: roomData.discussDuration,
            voteDuration: roomData.voteDuration,
            phase: String(roomData.phase ?? ""),
        };

        if (userId && activePlayersIds.includes(userId)) {
            await redis.hset(`room:${upperCode}`, { [`p:${userId}:lastSeen`]: Date.now() });
        }

        if (room.roomStatus === "waiting" && Math.random() < 0.1) {
            const now = Date.now();
            for (const player of room.players) {
                if (player.id !== userId && now - player.lastSeen > (180 * 1000)) {
                    await deletePlayer(upperCode, player.id);
                }
            }
        }

        return { room, userId };
    } catch (error) {
        console.error(`[getRoomState] Error for room ${upperCode}:`, error);
        throw error;
    }
}

export const dynamic = 'force-dynamic';
export async function GET(_request: NextRequest, context: RouteContext<'/api/room/[roomcode]'>) {
    const { roomcode } = await context.params;
    const { room, userId } = await getRoomState(roomcode);
    return NextResponse.json({ room, userId });
}
