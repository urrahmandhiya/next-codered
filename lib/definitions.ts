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