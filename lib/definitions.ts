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
}

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    createdAt: number;
}

export type RoomMetaData = {
    roomStatus: string; // implement enums later
    roomHostId: string;
    maxPlayersInRoom: number;
    playersInRoom: number;
    activePlayersIds: string;
};

export type DynamicPlayerFields = {
    [key: string]: string | number;
};

export type ActivePlayersIds = {
    id: string;
}

export type RedisRoom = RoomMetaData & DynamicPlayerFields;