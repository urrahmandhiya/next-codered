export type ActionResponse =
    | { success: true; message: string}
    | { success: false; error: string; message?: string}
    | null;

export interface Room {
    roomStatus: string;
    roomHostId: string;
    players: Player[];
    maxPlayersInRoom: number;
    playersInRoom: number;
    roles: Role[];
}


export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    createdAt: number;
    lastSeen?: number;
    role: string;
}

type RoomMetaData = {
    roomStatus: string; // implement enums later
    roomHostId: string;
    maxPlayersInRoom: number;
    playersInRoom: number;
    activePlayersIds: string;
};

type DynamicFields = {
    [key: string]: string | number;
};

export type Role = {
    name: string;
    amount: number
}

export type RedisRoom = RoomMetaData & DynamicFields;

export type GameRoomMetaData = {
    phase: string;
    phaseEndAt: number;
    round: number;
}

export interface GameState {
    phase: string;
    phaseEndAt: number;
    round: number;
    user: InGamePlayer;
    players: InGamePlayer[];
}

export interface InGamePlayer {
    id: string;
    name: string;
    status: string;
    role: string;
}

export type RedisGameRoom = GameRoomMetaData & DynamicFields;