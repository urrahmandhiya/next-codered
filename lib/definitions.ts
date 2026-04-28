export interface ActionState {
    message?: string | null;
    error?: string | null;
}

export type ActionResponse =
    | { success: null; error: string }
    | { success: string; error: null };

export interface Room {
  status: string;
  hostId: string;
  players: Player[];
  maxPlayer: number;
  currentPlayer: number;
}

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    createdAt: number;
}

export type RoomMetaData = {
    status: string; // implement enums later
    hostId: string;
    maxPlayer: number;
    currentPlayer: number;
};

export type DynamicPlayers = {
    [key: string]: string | Player;
};

export type RedisRoom = RoomMetaData & DynamicPlayers;