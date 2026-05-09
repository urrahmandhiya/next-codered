export interface ActionState {
    message?: string | null;
    error?: string | null;
}

export type ActionResponse =
    | { success: null; error: string }
    | { success: string; error: null };

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
    role: string;
}

export type RoomMetaData = {
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

export type ActivePlayersIds = {
    id: string;
}

export type RedisRoom = RoomMetaData & DynamicFields;