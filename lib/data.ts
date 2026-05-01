import { getRoomState } from "./actions/room";

export async function updateRoomState(roomCode: string) {
    const { room } = await getRoomState(roomCode);
    if (!room) {
        throw new Error('room not found');
    }
    console.log("FETCHING....")
    return room;
};