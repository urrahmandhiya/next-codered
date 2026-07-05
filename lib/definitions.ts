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
    discussDuration: number;
    voteDuration: number;
    phase?: string;
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
    discussDuration: number;
    voteDuration: number;
};

export type DynamicFields = {
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
    discussDuration: number;
    voteDuration: number;
    lastDeadPlayerId: string;
    voterByCandidate: string;
    goodSide: number;
    badSide: number;
    endGame: string;
    resolvingEndAt: number;
}

export interface GameState {
    phase: string;
    phaseEndAt: number;
    round: number;
    user: InGamePlayer;
    players: InGamePlayer[];
    lastDeadPlayerId: string;
    voterByCandidate: Record<string, string[]>;
    endGame: string;
}

export interface InGamePlayer {
    id: string;
    name: string;
    status: string;
    role: string;
    side: string;
}

type DynamicGameRoomMetaData = Omit<GameRoomMetaData, 'discussDuration' | 'voteDuration'>

export type RedisGameRoom = DynamicGameRoomMetaData & DynamicFields;