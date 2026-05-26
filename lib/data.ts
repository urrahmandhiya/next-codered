import { getGameState } from "./actions/game";
import { getRoomState } from "./actions/room";

export async function updateRoomState(roomCode: string) {
    const { room } = await getRoomState(roomCode);
    if (!room) {
        throw new Error('room not found');
    }
    console.log("FETCHING....")
    return room;
};

export async function updateGameState(roomCode: string) {
    const { gameState } = await getGameState(roomCode);
    if (!gameState) {
        throw new Error('room not found');
    }
    console.log("FETCHING GAMESTATE....")
    return gameState;
};